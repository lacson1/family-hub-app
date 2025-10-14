import { Router, Request, Response } from 'express';
import pool from '../database/db';
import { sendPushToUser } from '../services/pushNotifications';

const router = Router();

// Test endpoint to create sample notifications
router.post('/create-test-notifications/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const testNotifications = [
            {
                user_id: userId,
                title: '🎯 Task Reminder',
                message: 'Don\'t forget to complete "Grocery Shopping" by tomorrow!',
                type: 'info',
                category: 'task',
            },
            {
                user_id: userId,
                title: '🎉 Event Upcoming',
                message: 'Family dinner scheduled for tomorrow at 6:00 PM',
                type: 'success',
                category: 'event',
            },
            {
                user_id: userId,
                title: '💬 New Message',
                message: 'Mom sent you a new message: "Can you pick up milk?"',
                type: 'info',
                category: 'message',
            },
            {
                user_id: userId,
                title: '🛒 Shopping List Updated',
                message: 'Dad added 3 items to the shopping list',
                type: 'success',
                category: 'shopping',
            },
            {
                user_id: userId,
                title: '🍽️ Meal Planning',
                message: 'New meal "Spaghetti Bolognese" planned for Wednesday',
                type: 'info',
                category: 'meal',
            },
            {
                user_id: userId,
                title: '⚠️ Budget Alert',
                message: 'You\'ve spent 85% of your monthly grocery budget',
                type: 'warning',
                category: 'general',
            },
        ];

        const created = [];
        for (const notification of testNotifications) {
            const result = await pool.query(
                'INSERT INTO notifications (user_id, title, message, type, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [notification.user_id, notification.title, notification.message, notification.type, notification.category]
            );
            created.push(result.rows[0]);
        }

        res.json({
            success: true,
            message: `Created ${created.length} test notifications`,
            notifications: created
        });
    } catch (error) {
        console.error('Error creating test notifications:', error);
        res.status(500).json({ error: 'Failed to create test notifications' });
    }
});

// Test endpoint to send a push notification
router.post('/send-test-push/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { title, message } = req.body;

        const result = await sendPushToUser(userId, {
            title: title || '🔔 Test Notification',
            body: message || 'This is a test push notification from Family Hub!',
            icon: '/icon-192.svg',
            badge: '/icon-192.svg',
            tag: 'test-notification',
            data: { type: 'test', url: '/' },
        });

        res.json({
            success: true,
            message: 'Push notification sent',
            sent: result.sent,
            failed: result.failed
        });
    } catch (error) {
        console.error('Error sending test push notification:', error);
        res.status(500).json({ error: 'Failed to send test push notification' });
    }
});

// Get notification stats for a user
router.get('/stats/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const totalResult = await pool.query(
            'SELECT COUNT(*) as total FROM notifications WHERE user_id = $1',
            [userId]
        );

        const unreadResult = await pool.query(
            'SELECT COUNT(*) as unread FROM notifications WHERE user_id = $1 AND read = FALSE',
            [userId]
        );

        const byTypeResult = await pool.query(
            'SELECT type, COUNT(*) as count FROM notifications WHERE user_id = $1 GROUP BY type',
            [userId]
        );

        const byCategoryResult = await pool.query(
            'SELECT category, COUNT(*) as count FROM notifications WHERE user_id = $1 GROUP BY category',
            [userId]
        );

        res.json({
            total: parseInt(totalResult.rows[0].total),
            unread: parseInt(unreadResult.rows[0].unread),
            read: parseInt(totalResult.rows[0].total) - parseInt(unreadResult.rows[0].unread),
            byType: byTypeResult.rows,
            byCategory: byCategoryResult.rows
        });
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        res.status(500).json({ error: 'Failed to fetch notification stats' });
    }
});

// Clear all notifications for a user (for testing)
router.delete('/clear-all/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            'DELETE FROM notifications WHERE user_id = $1 RETURNING *',
            [userId]
        );

        res.json({
            success: true,
            message: `Deleted ${result.rows.length} notifications`,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

export default router;

