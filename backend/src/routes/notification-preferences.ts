import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';

const router = Router();

// Get notification preferences for a user
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            'SELECT * FROM notification_preferences WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // Return default preferences if none exist
            const defaultPreferences = {
                user_id: userId,
                enable_task: true,
                enable_event: true,
                enable_message: true,
                enable_shopping: true,
                enable_meal: true,
                enable_family: true,
                enable_general: true,
                enable_push_notifications: false,
                enable_browser_notifications: true,
                quiet_hours_enabled: false,
                quiet_hours_start: '22:00:00',
                quiet_hours_end: '07:00:00',
                enable_email_notifications: false,
                email_digest_frequency: 'daily'
            };

            return res.json(defaultPreferences);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        res.status(500).json({ error: 'Failed to fetch notification preferences' });
    }
});

// Update or create notification preferences
router.put('/:userId', [
    body('enable_task').optional().isBoolean(),
    body('enable_event').optional().isBoolean(),
    body('enable_message').optional().isBoolean(),
    body('enable_shopping').optional().isBoolean(),
    body('enable_meal').optional().isBoolean(),
    body('enable_family').optional().isBoolean(),
    body('enable_general').optional().isBoolean(),
    body('enable_push_notifications').optional().isBoolean(),
    body('enable_browser_notifications').optional().isBoolean(),
    body('quiet_hours_enabled').optional().isBoolean(),
    body('quiet_hours_start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    body('quiet_hours_end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    body('enable_email_notifications').optional().isBoolean(),
    body('email_digest_frequency').optional().isIn(['none', 'daily', 'weekly']),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { userId } = req.params;
        const preferences = req.body;

        // Build dynamic UPDATE query
        const fields = Object.keys(preferences);
        const values = Object.values(preferences);

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No preferences provided' });
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

        const query = `
            INSERT INTO notification_preferences (user_id, ${fields.join(', ')})
            VALUES ($1, ${fields.map((_, i) => `$${i + 2}`).join(', ')})
            ON CONFLICT (user_id) 
            DO UPDATE SET ${setClause}
            RETURNING *
        `;

        const result = await pool.query(query, [userId, ...values, ...values]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({ error: 'Failed to update notification preferences' });
    }
});

// Reset notification preferences to defaults
router.post('/:userId/reset', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        await pool.query('DELETE FROM notification_preferences WHERE user_id = $1', [userId]);

        res.json({
            success: true,
            message: 'Notification preferences reset to defaults'
        });
    } catch (error) {
        console.error('Error resetting notification preferences:', error);
        res.status(500).json({ error: 'Failed to reset notification preferences' });
    }
});

// Check if notifications should be sent based on preferences
router.post('/should-notify', [
    body('user_id').trim().notEmpty(),
    body('category').isIn(['task', 'event', 'message', 'shopping', 'meal', 'family', 'general']),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { user_id, category } = req.body;

        const result = await pool.query(
            'SELECT * FROM notification_preferences WHERE user_id = $1',
            [user_id]
        );

        let shouldNotify = true;
        let reason = '';

        if (result.rows.length > 0) {
            const prefs = result.rows[0];

            // Check if category is enabled
            const categoryField = `enable_${category}`;
            if (prefs[categoryField] === false) {
                shouldNotify = false;
                reason = `${category} notifications are disabled`;
            }

            // Check quiet hours
            if (shouldNotify && prefs.quiet_hours_enabled) {
                const now = new Date();
                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

                const start = prefs.quiet_hours_start;
                const end = prefs.quiet_hours_end;

                // Handle quiet hours that span midnight
                if (start > end) {
                    if (currentTime >= start || currentTime <= end) {
                        shouldNotify = false;
                        reason = 'Quiet hours active';
                    }
                } else {
                    if (currentTime >= start && currentTime <= end) {
                        shouldNotify = false;
                        reason = 'Quiet hours active';
                    }
                }
            }
        }

        res.json({
            should_notify: shouldNotify,
            reason: reason || 'Notifications enabled for this category'
        });
    } catch (error) {
        console.error('Error checking notification preferences:', error);
        res.status(500).json({ error: 'Failed to check notification preferences' });
    }
});

export default router;

