import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import pool from '../database/db';

const router = Router();

// Get spending trends
router.get(
    '/spending-trends',
    [
        query('months').optional().isInt({ min: 1, max: 24 }).toInt(),
        query('user_id').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { months = 6, user_id } = req.query;

            let queryStr = `
                SELECT 
                    DATE_TRUNC('month', date) as month,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income
                FROM transactions
                WHERE date >= NOW() - INTERVAL '${months} months'
            `;

            const params = [];
            if (user_id) {
                params.push(user_id);
                queryStr += ` AND added_by = $1`;
            }

            queryStr += ` GROUP BY DATE_TRUNC('month', date) ORDER BY month ASC`;

            const result = await pool.query(queryStr, params);

            const trends = result.rows.map(row => ({
                month: row.month,
                expenses: parseFloat(row.expenses),
                income: parseFloat(row.income),
                net: parseFloat(row.income) - parseFloat(row.expenses)
            }));

            res.json(trends);
        } catch (error) {
            console.error('Error fetching spending trends:', error);
            res.status(500).json({ error: 'Failed to fetch spending trends' });
        }
    }
);

// Get category breakdown
router.get(
    '/category-breakdown',
    [
        query('month').optional().isISO8601().toDate(),
        query('type').optional().isIn(['income', 'expense']),
        query('user_id').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { month, type = 'expense', user_id } = req.query;

            const targetMonth = month ? new Date(month as string) : new Date();
            const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1).toISOString().split('T')[0];
            const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).toISOString().split('T')[0];

            let queryStr = `
                SELECT 
                    category,
                    COUNT(*) as transaction_count,
                    SUM(amount) as total_amount
                FROM transactions
                WHERE date >= $1 AND date <= $2 AND type = $3
            `;

            const params: any[] = [monthStart, monthEnd, type];
            if (user_id) {
                params.push(user_id);
                queryStr += ` AND added_by = $4`;
            }

            queryStr += ` GROUP BY category ORDER BY total_amount DESC`;

            const result = await pool.query(queryStr, params);

            const breakdown = result.rows.map(row => ({
                category: row.category,
                transactionCount: parseInt(row.transaction_count, 10),
                totalAmount: parseFloat(row.total_amount)
            }));

            res.json(breakdown);
        } catch (error) {
            console.error('Error fetching category breakdown:', error);
            res.status(500).json({ error: 'Failed to fetch category breakdown' });
        }
    }
);

// Get budget status
router.get('/budget-status', async (req: Request, res: Response) => {
    try {
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        const result = await pool.query(
            `SELECT 
                b.category,
                b.amount as budget_amount,
                b.period,
                COALESCE(SUM(t.amount), 0) as spent_amount,
                COUNT(t.id) as transaction_count
            FROM budgets b
            LEFT JOIN transactions t ON t.category = b.category 
                AND t.type = 'expense' 
                AND t.date >= $1
            GROUP BY b.id, b.category, b.amount, b.period
            ORDER BY (COALESCE(SUM(t.amount), 0) / b.amount) DESC`,
            [monthStartStr]
        );

        const budgetStatus = result.rows.map(row => ({
            category: row.category,
            budgetAmount: parseFloat(row.budget_amount),
            spentAmount: parseFloat(row.spent_amount),
            remaining: parseFloat(row.budget_amount) - parseFloat(row.spent_amount),
            percentage: Math.round((parseFloat(row.spent_amount) / parseFloat(row.budget_amount)) * 100),
            transactionCount: parseInt(row.transaction_count, 10),
            period: row.period,
            status:
                (parseFloat(row.spent_amount) / parseFloat(row.budget_amount)) >= 1.0 ? 'over' :
                    (parseFloat(row.spent_amount) / parseFloat(row.budget_amount)) >= 0.9 ? 'warning' :
                        (parseFloat(row.spent_amount) / parseFloat(row.budget_amount)) >= 0.8 ? 'caution' : 'good'
        }));

        res.json(budgetStatus);
    } catch (error) {
        console.error('Error fetching budget status:', error);
        res.status(500).json({ error: 'Failed to fetch budget status' });
    }
});

// Get productivity stats
router.get('/productivity', async (req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        // Task completion by member
        const byMemberResult = await pool.query(
            `SELECT 
                assigned_to,
                COUNT(*) as total_tasks,
                SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN completed = false AND due_date < $1 THEN 1 ELSE 0 END) as overdue_tasks
            FROM tasks
            WHERE created_at >= $2
            GROUP BY assigned_to
            ORDER BY completed_tasks DESC`,
            [today, monthStartStr]
        );

        // Priority distribution
        const priorityResult = await pool.query(
            `SELECT 
                priority,
                COUNT(*) as count
            FROM tasks
            WHERE created_at >= $1
            GROUP BY priority
            ORDER BY 
                CASE priority 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    WHEN 'low' THEN 3 
                END`,
            [monthStartStr]
        );

        // Weekly completion rate
        const weeklyResult = await pool.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed
            FROM tasks
            WHERE created_at >= $1`,
            [weekStartStr]
        );

        const stats = {
            byMember: byMemberResult.rows.map(row => ({
                member: row.assigned_to,
                totalTasks: parseInt(row.total_tasks, 10),
                completedTasks: parseInt(row.completed_tasks, 10),
                overdueTasks: parseInt(row.overdue_tasks, 10),
                completionRate: row.total_tasks > 0
                    ? Math.round((row.completed_tasks / row.total_tasks) * 100)
                    : 0
            })),
            priorityDistribution: priorityResult.rows.map(row => ({
                priority: row.priority,
                count: parseInt(row.count, 10)
            })),
            thisWeek: {
                total: parseInt(weeklyResult.rows[0].total, 10),
                completed: parseInt(weeklyResult.rows[0].completed, 10),
                completionRate: weeklyResult.rows[0].total > 0
                    ? Math.round((weeklyResult.rows[0].completed / weeklyResult.rows[0].total) * 100)
                    : 0
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching productivity stats:', error);
        res.status(500).json({ error: 'Failed to fetch productivity stats' });
    }
});

// Get meal insights
router.get('/meal-insights', async (req: Request, res: Response) => {
    try {
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        // Meal type distribution
        const typeResult = await pool.query(
            `SELECT 
                meal_type,
                COUNT(*) as count
            FROM meals
            WHERE date >= $1
            GROUP BY meal_type
            ORDER BY count DESC`,
            [monthStartStr]
        );

        // Favorite meals
        const favoritesResult = await pool.query(
            `SELECT 
                name,
                COUNT(*) as times_made,
                MAX(date) as last_made
            FROM meals
            WHERE is_favorite = true
            GROUP BY name
            ORDER BY times_made DESC
            LIMIT 10`
        );

        // Most common ingredients
        const ingredientsResult = await pool.query(
            `SELECT 
                jsonb_array_elements(ingredients)->>'name' as ingredient,
                COUNT(*) as usage_count
            FROM meals
            WHERE date >= $1 AND ingredients IS NOT NULL
            GROUP BY ingredient
            ORDER BY usage_count DESC
            LIMIT 20`,
            [monthStartStr]
        );

        const insights = {
            mealTypeDistribution: typeResult.rows.map(row => ({
                mealType: row.meal_type,
                count: parseInt(row.count, 10)
            })),
            topFavorites: favoritesResult.rows.map(row => ({
                name: row.name,
                timesMade: parseInt(row.times_made, 10),
                lastMade: row.last_made,
                daysSinceLastMade: Math.floor((Date.now() - new Date(row.last_made).getTime()) / (1000 * 60 * 60 * 24))
            })),
            topIngredients: ingredientsResult.rows.map(row => ({
                ingredient: row.ingredient,
                usageCount: parseInt(row.usage_count, 10)
            }))
        };

        res.json(insights);
    } catch (error) {
        console.error('Error fetching meal insights:', error);
        res.status(500).json({ error: 'Failed to fetch meal insights' });
    }
});

// Get family activity stats
router.get('/family-activity', async (req: Request, res: Response) => {
    try {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];

        // Activity by user
        const activityResult = await pool.query(
            `SELECT 
                user_id,
                user_name,
                COUNT(*) as activity_count,
                jsonb_object_agg(entity_type, type_count) as breakdown
            FROM (
                SELECT 
                    user_id,
                    user_name,
                    entity_type,
                    COUNT(*) as type_count
                FROM activity_log
                WHERE created_at >= $1
                GROUP BY user_id, user_name, entity_type
            ) sub
            GROUP BY user_id, user_name
            ORDER BY activity_count DESC`,
            [weekStartStr]
        );

        // Messages sent
        const messagesResult = await pool.query(
            `SELECT 
                sender_id,
                COUNT(*) as messages_sent
            FROM messages
            WHERE created_at >= $1
            GROUP BY sender_id`,
            [weekStartStr]
        );

        const stats = {
            byUser: activityResult.rows.map(row => ({
                userId: row.user_id,
                userName: row.user_name,
                activityCount: parseInt(row.activity_count, 10),
                breakdown: row.breakdown
            })),
            messagesSent: messagesResult.rows.map(row => ({
                userId: row.sender_id,
                count: parseInt(row.messages_sent, 10)
            }))
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching family activity stats:', error);
        res.status(500).json({ error: 'Failed to fetch family activity stats' });
    }
});

export default router;

