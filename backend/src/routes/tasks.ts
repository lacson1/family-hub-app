import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';
import { requireAuth } from '../middleware/auth';
import { requireFamily, type FamilyRequest } from '../middleware/family';

const router = Router();

// Get all tasks
router.get('/', requireAuth, requireFamily, async (req: FamilyRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE family_id = $1 ORDER BY due_date ASC, created_at DESC',
      [req.familyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', requireAuth, requireFamily, async (req: FamilyRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1 AND family_id = $2', [id, req.familyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
router.post(
  '/',
  requireAuth,
  requireFamily,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('assigned_to').trim().notEmpty().withMessage('Assigned to is required'),
    body('due_date').isDate().withMessage('Valid due date is required'),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  ],
  async (req: FamilyRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, assigned_to, due_date, priority } = req.body;
      const result = await pool.query(
        'INSERT INTO tasks (title, assigned_to, due_date, priority, family_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, assigned_to, due_date, priority, req.familyId]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

// Update task
router.put(
  '/:id',
  requireAuth,
  requireFamily,
  [
    body('title').optional().trim().notEmpty(),
    body('assigned_to').optional().trim().notEmpty(),
    body('due_date').optional().isDate(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('completed').optional().isBoolean(),
  ],
  async (req: FamilyRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { title, assigned_to, due_date, priority, completed } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (assigned_to !== undefined) {
        updates.push(`assigned_to = $${paramCount++}`);
        values.push(assigned_to);
      }
      if (due_date !== undefined) {
        updates.push(`due_date = $${paramCount++}`);
        values.push(due_date);
      }
      if (priority !== undefined) {
        updates.push(`priority = $${paramCount++}`);
        values.push(priority);
      }
      if (completed !== undefined) {
        updates.push(`completed = $${paramCount++}`);
        values.push(completed);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await pool.query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount} AND family_id = $${paramCount + 1} RETURNING *`,
        [...values, req.familyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
);

// Delete task
router.delete('/:id', requireAuth, requireFamily, async (req: FamilyRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND family_id = $2 RETURNING *', [id, req.familyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;

