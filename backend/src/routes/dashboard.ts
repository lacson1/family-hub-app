import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import pool from '../database/db';

const router = Router();

// Get dashboard summary
router.get(
    '/summary',
    [
        query('user_id').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { user_id } = req.query;
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // Get today's tasks
            const tasksResult = await pool.query(
                `SELECT * FROM tasks 
                WHERE due_date = $1 
                ORDER BY priority DESC, created_at ASC`,
                [today]
            );

            // Get today's meals
            const mealsResult = await pool.query(
                `SELECT * FROM meals 
                WHERE date = $1 
                ORDER BY meal_type ASC`,
                [today]
            );

            // Get upcoming events (next 24 hours)
            const eventsResult = await pool.query(
                `SELECT * FROM events 
                WHERE date >= $1 AND date <= $2 
                ORDER BY date ASC, time ASC 
                LIMIT 5`,
                [today, tomorrow]
            );

            // Get unread message count
            let unreadMessages = 0;
            if (user_id) {
                const messagesResult = await pool.query(
                    `SELECT COUNT(*) as count FROM messages 
                    WHERE recipient_id = $1 AND read = false`,
                    [user_id]
                );
                unreadMessages = parseInt(messagesResult.rows[0].count, 10);
            }

            // Get pending shopping items
            const shoppingResult = await pool.query(
                `SELECT COUNT(*) as count FROM shopping_items 
                WHERE purchased = false`
            );
            const pendingShopping = parseInt(shoppingResult.rows[0].count, 10);

            // Get task completion rate (this week)
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
            const weekStartStr = weekStart.toISOString().split('T')[0];

            const taskStatsResult = await pool.query(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed
                FROM tasks 
                WHERE created_at >= $1`,
                [weekStartStr]
            );

            const taskStats = taskStatsResult.rows[0];
            const completionRate = taskStats.total > 0
                ? Math.round((taskStats.completed / taskStats.total) * 100)
                : 0;

            // Get budget status (current month)
            const monthStart = new Date();
            monthStart.setDate(1);
            const monthStartStr = monthStart.toISOString().split('T')[0];

            const budgetResult = await pool.query(
                `SELECT 
                    b.category,
                    b.amount as budget_amount,
                    COALESCE(SUM(t.amount), 0) as spent_amount
                FROM budgets b
                LEFT JOIN transactions t ON t.category = b.category 
                    AND t.type = 'expense' 
                    AND t.date >= $1
                WHERE b.period = 'monthly'
                GROUP BY b.id, b.category, b.amount
                ORDER BY (COALESCE(SUM(t.amount), 0) / b.amount) DESC`,
                [monthStartStr]
            );

            const budgetStatus = budgetResult.rows.map(row => {
                const budgetAmountNum = parseFloat(row.budget_amount);
                const spentAmountNum = parseFloat(row.spent_amount);
                const percentage = budgetAmountNum > 0
                    ? Math.round((spentAmountNum / budgetAmountNum) * 100)
                    : 0;
                return {
                    category: row.category,
                    budgetAmount: budgetAmountNum,
                    spentAmount: spentAmountNum,
                    percentage
                };
            });

            // Get recent activity
            const activityResult = await pool.query(
                `SELECT * FROM activity_log 
                ORDER BY created_at DESC 
                LIMIT 20`
            );

            // Get family members count
            const familyResult = await pool.query(
                `SELECT COUNT(*) as count FROM family_members`
            );
            const familyMembersCount = parseInt(familyResult.rows[0].count, 10);

            // Compile dashboard summary
            const summary = {
                today: {
                    date: today,
                    tasks: tasksResult.rows,
                    meals: mealsResult.rows,
                    events: eventsResult.rows
                },
                stats: {
                    unreadMessages,
                    pendingShopping,
                    taskCompletionRate: completionRate,
                    tasksThisWeek: {
                        total: parseInt(taskStats.total, 10),
                        completed: parseInt(taskStats.completed, 10)
                    },
                    familyMembersCount
                },
                budgets: budgetStatus,
                recentActivity: activityResult.rows
            };

            res.json(summary);
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard summary' });
        }
    }
);

// Get quick stats
router.get('/quick-stats', async (req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Tasks due today
        const tasksTodayResult = await pool.query(
            `SELECT COUNT(*) as count FROM tasks 
            WHERE due_date = $1 AND completed = false`,
            [today]
        );

        // Overdue tasks
        const overdueTasksResult = await pool.query(
            `SELECT COUNT(*) as count FROM tasks 
            WHERE due_date < $1 AND completed = false`,
            [today]
        );

        // Events today
        const eventsTodayResult = await pool.query(
            `SELECT COUNT(*) as count FROM events 
            WHERE date = $1`,
            [today]
        );

        // Meals planned this week
        const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const mealsWeekResult = await pool.query(
            `SELECT COUNT(*) as count FROM meals 
            WHERE date >= $1 AND date <= $2`,
            [today, weekEnd]
        );

        // Pending shopping items
        const shoppingResult = await pool.query(
            `SELECT COUNT(*) as count FROM shopping_items 
            WHERE purchased = false`
        );

        const stats = {
            tasksDueToday: parseInt(tasksTodayResult.rows[0].count, 10),
            overdueTasks: parseInt(overdueTasksResult.rows[0].count, 10),
            eventsToday: parseInt(eventsTodayResult.rows[0].count, 10),
            mealsThisWeek: parseInt(mealsWeekResult.rows[0].count, 10),
            pendingShopping: parseInt(shoppingResult.rows[0].count, 10)
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching quick stats:', error);
        res.status(500).json({ error: 'Failed to fetch quick stats' });
    }
});

export default router;

