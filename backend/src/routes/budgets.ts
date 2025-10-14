import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';

const router = Router();

// Get all budgets
router.get('/', async (req: Request, res: Response) => {
    try {
        const { created_by } = req.query;
        let query = 'SELECT * FROM budgets';
        const params: string[] = [];

        if (created_by) {
            query += ' WHERE created_by = $1';
            params.push(created_by as string);
        }

        query += ' ORDER BY category ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
});

// Get budget with spending
router.get('/with-spending', async (req: Request, res: Response) => {
    try {
        const { period, created_by } = req.query;

        // Calculate date range based on period
        const now = new Date();
        let startDate: Date;

        if (period === 'monthly') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
            startDate = new Date(now.getFullYear(), 0, 1);
        }

        const endDate = new Date();

        let query = `
      SELECT 
        b.id,
        b.category,
        b.amount as budget_amount,
        b.period,
        COALESCE(SUM(t.amount), 0) as spent_amount,
        b.amount - COALESCE(SUM(t.amount), 0) as remaining
      FROM budgets b
      LEFT JOIN transactions t ON 
        b.category = t.category 
        AND t.type = 'expense'
        AND t.date BETWEEN $1 AND $2
    `;

        const params: (string | Date)[] = [startDate, endDate];
        let paramCount = 3;

        if (created_by) {
            query += ` WHERE b.created_by = $${paramCount++}`;
            params.push(created_by as string);
        }

        if (period) {
            query += created_by ? ' AND' : ' WHERE';
            query += ` b.period = $${paramCount++}`;
            params.push(period as string);
        }

        query += ' GROUP BY b.id, b.category, b.amount, b.period ORDER BY b.category';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching budgets with spending:', error);
        res.status(500).json({ error: 'Failed to fetch budgets with spending' });
    }
});

// Create budget
router.post(
    '/',
    [
        body('category').trim().notEmpty().withMessage('Category is required'),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
        body('period').isIn(['monthly', 'yearly']).withMessage('Period must be monthly or yearly'),
        body('created_by').trim().notEmpty().withMessage('Created by is required'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { category, amount, period, created_by } = req.body;
            const result = await pool.query(
                'INSERT INTO budgets (category, amount, period, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
                [category, amount, period, created_by]
            );
            res.status(201).json(result.rows[0]);
        } catch (error: unknown) {
            console.error('Error creating budget:', error);
            if (error instanceof Error && 'code' in error && error.code === '23505') {
                res.status(409).json({ error: 'Budget already exists for this category and period' });
            } else {
                res.status(500).json({ error: 'Failed to create budget' });
            }
        }
    }
);

// Update budget
router.put(
    '/:id',
    [
        body('amount').optional().isFloat({ min: 0.01 }),
        body('period').optional().isIn(['monthly', 'yearly']),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { amount, period } = req.body;

            const updates = [];
            const values = [];
            let paramCount = 1;

            if (amount !== undefined) {
                updates.push(`amount = $${paramCount++}`);
                values.push(amount);
            }
            if (period !== undefined) {
                updates.push(`period = $${paramCount++}`);
                values.push(period);
            }

            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const result = await pool.query(
                `UPDATE budgets SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Budget not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating budget:', error);
            res.status(500).json({ error: 'Failed to update budget' });
        }
    }
);

// Delete budget
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM budgets WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ error: 'Failed to delete budget' });
    }
});

export default router;

