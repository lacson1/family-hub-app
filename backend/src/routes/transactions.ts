import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';
import { requireAuth } from '../middleware/auth';
import { requireFamily, type FamilyRequest } from '../middleware/family';

const router = Router();

// Get all transactions
router.get('/', requireAuth, requireFamily, async (req: FamilyRequest, res: Response) => {
    try {
        const { start_date, end_date } = req.query;
        let query = 'SELECT * FROM transactions WHERE family_id = $1';
        const params: any[] = [req.familyId];
        let paramCount = 2;

        if (start_date && end_date) {
            query += ` AND date BETWEEN $${paramCount} AND $${paramCount + 1}`;
            params.push(start_date as string, end_date as string);
            paramCount += 2;
        }

        query += ' ORDER BY date DESC, created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Export transactions as CSV
router.get('/export/csv', async (req: Request, res: Response) => {
    try {
        const { start_date, end_date } = req.query;
        let query = 'SELECT * FROM transactions';
        const params: string[] = [];

        if (start_date && end_date) {
            query += ' WHERE date BETWEEN $1 AND $2';
            params.push(start_date as string, end_date as string);
        }

        query += ' ORDER BY date DESC';

        const result = await pool.query(query, params);

        // Build CSV
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Payment Method', 'Added By'];
        const csvRows = [headers.join(',')];

        result.rows.forEach(row => {
            const values = [
                row.date,
                row.type,
                row.category,
                row.amount,
                row.description || '',
                row.payment_method || '',
                row.added_by
            ];
            csvRows.push(values.map(v => `"${v}"`).join(','));
        });

        const csv = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting transactions:', error);
        res.status(500).json({ error: 'Failed to export transactions' });
    }
});

// Get single transaction
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
});

// Get transaction summary statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance,
                COUNT(CASE WHEN type = 'income' THEN 1 END) as "incomeCount",
                COUNT(CASE WHEN type = 'expense' THEN 1 END) as "expenseCount"
            FROM transactions
        `;

        const params = [];
        const conditions = [];

        if (startDate) {
            params.push(startDate);
            conditions.push(`date >= $${params.length}`);
        }
        if (endDate) {
            params.push(endDate);
            conditions.push(`date <= $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({ error: 'Failed to fetch transaction summary' });
    }
});

// Get transactions by category
router.get('/stats/by-category', async (req: Request, res: Response) => {
    try {
        const { type, startDate, endDate } = req.query;

        let query = `
            SELECT 
                category,
                type,
                COALESCE(SUM(amount), 0) as total,
                COUNT(*) as count
            FROM transactions
        `;

        const params = [];
        const conditions = [];

        if (type) {
            params.push(type);
            conditions.push(`type = $${params.length}`);
        }
        if (startDate) {
            params.push(startDate);
            conditions.push(`date >= $${params.length}`);
        }
        if (endDate) {
            params.push(endDate);
            conditions.push(`date <= $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ' GROUP BY category, type ORDER BY total DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions by category:', error);
        res.status(500).json({ error: 'Failed to fetch transactions by category' });
    }
});

// Create transaction
router.post(
    '/',
    [
        body('type').isIn(['income', 'expense']).withMessage('Invalid transaction type'),
        body('category').trim().notEmpty().withMessage('Category is required'),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
        body('date').isDate().withMessage('Valid date is required'),
        body('added_by').trim().notEmpty().withMessage('Added by is required'),
        body('is_recurring').optional().isBoolean(),
        body('recurrence_frequency').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']),
        body('recurrence_end_date').optional().isDate(),
        body('description').optional().trim(),
        body('payment_method').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { type, category, amount, description, date, payment_method, added_by, is_recurring, recurrence_frequency, recurrence_end_date } = req.body;
            const result = await pool.query(
                'INSERT INTO transactions (type, category, amount, description, date, payment_method, added_by, is_recurring, recurrence_frequency, recurrence_end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
                [type, category, amount, description || null, date, payment_method || null, added_by, is_recurring || false, recurrence_frequency || null, recurrence_end_date || null]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating transaction:', error);
            res.status(500).json({ error: 'Failed to create transaction' });
        }
    }
);

// Update transaction
router.put(
    '/:id',
    [
        body('type').optional().isIn(['income', 'expense']),
        body('category').optional().trim().notEmpty(),
        body('amount').optional().isFloat({ min: 0.01 }),
        body('date').optional().isDate(),
        body('description').optional().trim(),
        body('payment_method').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { type, category, amount, description, date, payment_method } = req.body;

            const updates = [];
            const values = [];
            let paramCount = 1;

            if (type !== undefined) {
                updates.push(`type = $${paramCount++}`);
                values.push(type);
            }
            if (category !== undefined) {
                updates.push(`category = $${paramCount++}`);
                values.push(category);
            }
            if (amount !== undefined) {
                updates.push(`amount = $${paramCount++}`);
                values.push(amount);
            }
            if (description !== undefined) {
                updates.push(`description = $${paramCount++}`);
                values.push(description);
            }
            if (date !== undefined) {
                updates.push(`date = $${paramCount++}`);
                values.push(date);
            }
            if (payment_method !== undefined) {
                updates.push(`payment_method = $${paramCount++}`);
                values.push(payment_method);
            }

            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const result = await pool.query(
                `UPDATE transactions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating transaction:', error);
            res.status(500).json({ error: 'Failed to update transaction' });
        }
    }
);

// Delete transaction
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

export default router;
