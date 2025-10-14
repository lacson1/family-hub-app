import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import pool from '../database/db';

const router = Router();

// Get notifications for a user
router.get(
    '/',
    [
        query('user_id').optional().trim(),
        query('read').optional().isBoolean().toBoolean(),
    ],
    async (req: Request, res: Response) => {
        try {
            const { user_id, read } = req.query;

            let queryStr = 'SELECT * FROM notifications';
            const conditions = [];
            const params = [];

            if (user_id) {
                params.push(user_id);
                conditions.push(`user_id = $${params.length}`);
            }

            if (read !== undefined) {
                params.push(read);
                conditions.push(`read = $${params.length}`);
            }

            if (conditions.length > 0) {
                queryStr += ` WHERE ${conditions.join(' AND ')}`;
            }

            queryStr += ' ORDER BY created_at DESC';

            const result = await pool.query(queryStr, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    }
);

// Get single notification
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM notifications WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({ error: 'Failed to fetch notification' });
    }
});

// Create notification
router.post(
    '/',
    [
        body('user_id').trim().notEmpty().withMessage('User ID is required'),
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('message').trim().notEmpty().withMessage('Message is required'),
        body('type').isIn(['info', 'success', 'warning', 'error']).withMessage('Invalid notification type'),
        body('category').isIn(['task', 'event', 'message', 'shopping', 'meal', 'family', 'general']).withMessage('Invalid category'),
        body('action_url').optional().trim(),
        body('related_id').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { user_id, title, message, type, category, action_url, related_id } = req.body;
            const result = await pool.query(
                'INSERT INTO notifications (user_id, title, message, type, category, action_url, related_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [user_id, title, message, type, category, action_url || null, related_id || null]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating notification:', error);
            res.status(500).json({ error: 'Failed to create notification' });
        }
    }
);

// Mark notification as read
router.put('/:id/read', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE notifications SET read = TRUE WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Delete notification
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;
