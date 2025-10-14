import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/events');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image and document files are allowed'));
    }
  }
});

// Get all events with attendees and attachments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { created_by, start_date, end_date } = req.query;

    let query = 'SELECT * FROM events WHERE 1=1';
    const values: string[] = [];
    let paramCount = 1;

    if (created_by && typeof created_by === 'string') {
      query += ` AND created_by = $${paramCount}`;
      values.push(created_by);
      paramCount++;
    }

    if (start_date && typeof start_date === 'string') {
      query += ` AND date >= $${paramCount}`;
      values.push(start_date);
      paramCount++;
    }

    if (end_date && typeof end_date === 'string') {
      query += ` AND date <= $${paramCount}`;
      values.push(end_date);
      paramCount++;
    }

    query += ' ORDER BY date ASC, time ASC';

    const result = await pool.query(query, values);

    // Fetch attendees and attachments for each event
    const eventsWithDetails = await Promise.all(
      result.rows.map(async (event) => {
        const attendeesResult = await pool.query(
          `SELECT ea.*, fm.name as family_member_name, fm.color as family_member_color 
           FROM event_attendees ea 
           LEFT JOIN family_members fm ON ea.family_member_id = fm.id 
           WHERE ea.event_id = $1`,
          [event.id]
        );

        const attachmentsResult = await pool.query(
          'SELECT * FROM event_attachments WHERE event_id = $1 ORDER BY created_at DESC',
          [event.id]
        );

        return {
          ...event,
          attendees: attendeesResult.rows,
          attachments: attachmentsResult.rows
        };
      })
    );

    res.json(eventsWithDetails);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event with details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = result.rows[0];

    // Fetch attendees
    const attendeesResult = await pool.query(
      `SELECT ea.*, fm.name as family_member_name, fm.color as family_member_color 
       FROM event_attendees ea 
       LEFT JOIN family_members fm ON ea.family_member_id = fm.id 
       WHERE ea.event_id = $1`,
      [id]
    );

    // Fetch attachments
    const attachmentsResult = await pool.query(
      'SELECT * FROM event_attachments WHERE event_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      ...event,
      attendees: attendeesResult.rows,
      attachments: attachmentsResult.rows
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('date').isDate().withMessage('Valid date is required'),
    body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required'),
    body('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
    body('all_day').optional().isBoolean(),
    body('type').isIn(['family', 'personal', 'work']).withMessage('Invalid type'),
    body('description').optional().trim(),
    body('location').optional().trim(),
    body('created_by').optional().trim(),
    body('google_event_id').optional().trim(),
    body('reminder_minutes').optional().isInt({ min: 0 }),
    body('attendees').optional().isArray(),
    body('recurring_rule').optional().isObject(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        title, date, time, end_time, all_day, type, description,
        location, created_by, google_event_id, reminder_minutes,
        attendees, recurring_rule
      } = req.body;

      // Validate: all_day events should not have time
      if (all_day && (time || end_time)) {
        return res.status(400).json({ error: 'All-day events should not have time values' });
      }

      // Validate: non all_day events must have time
      if (!all_day && !time) {
        return res.status(400).json({ error: 'Non all-day events must have a start time' });
      }

      const result = await client.query(
        `INSERT INTO events (title, date, time, end_time, all_day, type, description, location, created_by, google_event_id, reminder_minutes, recurring_rule) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          title,
          date,
          all_day ? null : time,
          all_day ? null : end_time,
          all_day || false,
          type,
          description || null,
          location || null,
          created_by || null,
          google_event_id || null,
          reminder_minutes || null,
          recurring_rule ? JSON.stringify(recurring_rule) : null
        ]
      );

      const newEvent = result.rows[0];

      // Add attendees if provided
      if (attendees && Array.isArray(attendees) && attendees.length > 0) {
        for (const attendee of attendees) {
          await client.query(
            'INSERT INTO event_attendees (event_id, family_member_id, user_email, status) VALUES ($1, $2, $3, $4)',
            [newEvent.id, attendee.family_member_id || null, attendee.user_email || null, attendee.status || 'pending']
          );
        }
      }

      // Create reminder if reminder_minutes is set
      if (reminder_minutes) {
        const eventDateTime = all_day
          ? new Date(date)
          : new Date(`${date}T${time}`);
        const remindAt = new Date(eventDateTime.getTime() - (reminder_minutes * 60 * 1000));

        await client.query(
          'INSERT INTO event_reminders (event_id, remind_at, reminder_type) VALUES ($1, $2, $3)',
          [newEvent.id, remindAt, 'notification']
        );
      }

      await client.query('COMMIT');

      // Fetch complete event with attendees
      const attendeesResult = await pool.query(
        `SELECT ea.*, fm.name as family_member_name, fm.color as family_member_color 
         FROM event_attendees ea 
         LEFT JOIN family_members fm ON ea.family_member_id = fm.id 
         WHERE ea.event_id = $1`,
        [newEvent.id]
      );

      res.status(201).json({
        ...newEvent,
        attendees: attendeesResult.rows,
        attachments: []
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    } finally {
      client.release();
    }
  }
);

// Update event
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('date').optional().isDate(),
    body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('all_day').optional().isBoolean(),
    body('type').optional().isIn(['family', 'personal', 'work']),
    body('description').optional().trim(),
    body('location').optional().trim(),
    body('google_event_id').optional().trim(),
    body('reminder_minutes').optional().isInt({ min: 0 }),
    body('attendees').optional().isArray(),
    body('recurring_rule').optional().isObject(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { id } = req.params;
      const {
        title, date, time, end_time, all_day, type, description,
        location, google_event_id, reminder_minutes, attendees, recurring_rule
      } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (date !== undefined) {
        updates.push(`date = $${paramCount++}`);
        values.push(date);
      }
      if (time !== undefined) {
        updates.push(`time = $${paramCount++}`);
        values.push(time);
      }
      if (end_time !== undefined) {
        updates.push(`end_time = $${paramCount++}`);
        values.push(end_time);
      }
      if (all_day !== undefined) {
        updates.push(`all_day = $${paramCount++}`);
        values.push(all_day);
      }
      if (type !== undefined) {
        updates.push(`type = $${paramCount++}`);
        values.push(type);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (location !== undefined) {
        updates.push(`location = $${paramCount++}`);
        values.push(location);
      }
      if (google_event_id !== undefined) {
        updates.push(`google_event_id = $${paramCount++}`);
        values.push(google_event_id);
      }
      if (reminder_minutes !== undefined) {
        updates.push(`reminder_minutes = $${paramCount++}`);
        values.push(reminder_minutes);
      }
      if (recurring_rule !== undefined) {
        updates.push(`recurring_rule = $${paramCount++}`);
        values.push(recurring_rule ? JSON.stringify(recurring_rule) : null);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      if (updates.length === 1) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const result = await client.query(
        `UPDATE events SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Event not found' });
      }

      // Update attendees if provided
      if (attendees !== undefined && Array.isArray(attendees)) {
        // Delete existing attendees
        await client.query('DELETE FROM event_attendees WHERE event_id = $1', [id]);

        // Add new attendees
        for (const attendee of attendees) {
          await client.query(
            'INSERT INTO event_attendees (event_id, family_member_id, user_email, status) VALUES ($1, $2, $3, $4)',
            [id, attendee.family_member_id || null, attendee.user_email || null, attendee.status || 'pending']
          );
        }
      }

      // Update reminders if reminder_minutes changed
      if (reminder_minutes !== undefined) {
        await client.query('DELETE FROM event_reminders WHERE event_id = $1 AND sent = FALSE', [id]);

        if (reminder_minutes > 0) {
          const updatedEvent = result.rows[0];
          const eventDateTime = updatedEvent.all_day
            ? new Date(updatedEvent.date)
            : new Date(`${updatedEvent.date}T${updatedEvent.time}`);
          const remindAt = new Date(eventDateTime.getTime() - (reminder_minutes * 60 * 1000));

          await client.query(
            'INSERT INTO event_reminders (event_id, remind_at, reminder_type) VALUES ($1, $2, $3)',
            [id, remindAt, 'notification']
          );
        }
      }

      await client.query('COMMIT');

      // Fetch complete event with attendees and attachments
      const attendeesResult = await pool.query(
        `SELECT ea.*, fm.name as family_member_name, fm.color as family_member_color 
         FROM event_attendees ea 
         LEFT JOIN family_members fm ON ea.family_member_id = fm.id 
         WHERE ea.event_id = $1`,
        [id]
      );

      const attachmentsResult = await pool.query(
        'SELECT * FROM event_attachments WHERE event_id = $1 ORDER BY created_at DESC',
        [id]
      );

      res.json({
        ...result.rows[0],
        attendees: attendeesResult.rows,
        attachments: attachmentsResult.rows
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating event:', error);
      res.status(500).json({ error: 'Failed to update event' });
    } finally {
      client.release();
    }
  }
);

// Delete event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Upload attachment to event
router.post('/:id/attachments', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { uploaded_by } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if event exists
    const eventCheck = await pool.query('SELECT id FROM events WHERE id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const fileUrl = `/uploads/events/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO event_attachments (event_id, file_name, file_url, file_type, file_size, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, req.file.originalname, fileUrl, req.file.mimetype, req.file.size, uploaded_by || 'unknown']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
});

// Delete attachment
router.delete('/:eventId/attachments/:attachmentId', async (req: Request, res: Response) => {
  try {
    const { eventId, attachmentId } = req.params;

    const result = await pool.query(
      'DELETE FROM event_attachments WHERE id = $1 AND event_id = $2 RETURNING file_url',
      [attachmentId, eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Optionally delete the physical file
    const filePath = path.join(__dirname, '../..', result.rows[0].file_url);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

// Quick update event date/time (for drag and drop)
router.patch('/:id/datetime', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, time, end_time } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(date);
    }
    if (time !== undefined) {
      updates.push(`time = $${paramCount++}`);
      values.push(time);
    }
    if (end_time !== undefined) {
      updates.push(`end_time = $${paramCount++}`);
      values.push(end_time);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE events SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event datetime:', error);
    res.status(500).json({ error: 'Failed to update event datetime' });
  }
});

export default router;

