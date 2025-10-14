import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import pool from '../database/db';
import { wsManager } from '../realtime/websocket';

const router = Router();

// Get recent activity logs
router.get(
    '/',
    [
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        query('user_id').optional().trim(),
        query('entity_type').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { limit = 50, user_id, entity_type } = req.query;

            let queryStr = 'SELECT * FROM activity_log';
            const conditions = [];
            const params = [];

            if (user_id) {
                params.push(user_id);
                conditions.push(`user_id = $${params.length}`);
            }

            if (entity_type) {
                params.push(entity_type);
                conditions.push(`entity_type = $${params.length}`);
            }

            if (conditions.length > 0) {
                queryStr += ` WHERE ${conditions.join(' AND ')}`;
            }

            queryStr += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
            params.push(limit);

            const result = await pool.query(queryStr, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            res.status(500).json({ error: 'Failed to fetch activity logs' });
        }
    }
);

// Create activity log
router.post(
    '/',
    [
        body('user_id').trim().notEmpty().withMessage('User ID is required'),
        body('user_name').optional().trim(),
        body('action_type').trim().notEmpty().withMessage('Action type is required'),
        body('entity_type').trim().notEmpty().withMessage('Entity type is required'),
        body('entity_id').optional().trim(),
        body('description').trim().notEmpty().withMessage('Description is required'),
        body('metadata').optional().isObject(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { user_id, user_name, action_type, entity_type, entity_id, description, metadata } = req.body;

            const result = await pool.query(
                `INSERT INTO activity_log 
                (user_id, user_name, action_type, entity_type, entity_id, description, metadata) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *`,
                [user_id, user_name || null, action_type, entity_type, entity_id || null, description, metadata ? JSON.stringify(metadata) : null]
            );

            const activity = result.rows[0];

            // Broadcast activity to all connected clients
            wsManager.broadcastActivityLog(activity);

            res.status(201).json(activity);
        } catch (error) {
            console.error('Error creating activity log:', error);
            res.status(500).json({ error: 'Failed to create activity log' });
        }
    }
);

// Delete old activity logs (cleanup)
router.delete(
    '/cleanup',
    [
        query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { days = 30 } = req.query;

            const result = await pool.query(
                `DELETE FROM activity_log 
                WHERE created_at < NOW() - INTERVAL '${days} days' 
                RETURNING id`,
            );

            res.json({
                message: `Deleted ${result.rowCount} activity logs older than ${days} days`,
                count: result.rowCount
            });
        } catch (error) {
            console.error('Error cleaning up activity logs:', error);
            res.status(500).json({ error: 'Failed to cleanup activity logs' });
        }
    }
);

// Helper function to log activities (can be imported by other routes)
export const logActivity = async (
    userId: string,
    userName: string,
    actionType: string,
    entityType: string,
    entityId: string | null,
    description: string,
    metadata?: any
): Promise<void> => {
    try {
        const result = await pool.query(
            `INSERT INTO activity_log 
            (user_id, user_name, action_type, entity_type, entity_id, description, metadata) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [userId, userName, actionType, entityType, entityId, description, metadata ? JSON.stringify(metadata) : null]
        );

        // Broadcast to WebSocket clients
        wsManager.broadcastActivityLog(result.rows[0]);
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw error - logging should not break main functionality
    }
};

export default router;

