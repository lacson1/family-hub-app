import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';

const router = Router();

// Get all shopping items
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM shopping_items ORDER BY purchased ASC, created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching shopping items:', error);
        res.status(500).json({ error: 'Failed to fetch shopping items' });
    }
});

// Get single shopping item
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM shopping_items WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Shopping item not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching shopping item:', error);
        res.status(500).json({ error: 'Failed to fetch shopping item' });
    }
});

// Create shopping item
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('quantity').trim().notEmpty().withMessage('Quantity is required'),
        body('category').isIn(['Groceries', 'Household', 'Personal', 'Other']).withMessage('Invalid category'),
        body('added_by').trim().notEmpty().withMessage('Added by is required'),
        body('notes').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, quantity, category, notes, added_by } = req.body;
            const result = await pool.query(
                'INSERT INTO shopping_items (name, quantity, category, notes, added_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, quantity, category, notes || null, added_by]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating shopping item:', error);
            res.status(500).json({ error: 'Failed to create shopping item' });
        }
    }
);

// Update shopping item
router.put(
    '/:id',
    [
        body('name').optional().trim().notEmpty(),
        body('quantity').optional().trim().notEmpty(),
        body('category').optional().isIn(['Groceries', 'Household', 'Personal', 'Other']),
        body('notes').optional().trim(),
        body('purchased').optional().isBoolean(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { name, quantity, category, notes, purchased } = req.body;

            const updates = [];
            const values = [];
            let paramCount = 1;

            if (name !== undefined) {
                updates.push(`name = $${paramCount++}`);
                values.push(name);
            }
            if (quantity !== undefined) {
                updates.push(`quantity = $${paramCount++}`);
                values.push(quantity);
            }
            if (category !== undefined) {
                updates.push(`category = $${paramCount++}`);
                values.push(category);
            }
            if (notes !== undefined) {
                updates.push(`notes = $${paramCount++}`);
                values.push(notes);
            }
            if (purchased !== undefined) {
                updates.push(`purchased = $${paramCount++}`);
                values.push(purchased);
            }

            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const result = await pool.query(
                `UPDATE shopping_items SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Shopping item not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating shopping item:', error);
            res.status(500).json({ error: 'Failed to update shopping item' });
        }
    }
);

// Delete shopping item
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM shopping_items WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Shopping item not found' });
        }

        res.json({ message: 'Shopping item deleted successfully' });
    } catch (error) {
        console.error('Error deleting shopping item:', error);
        res.status(500).json({ error: 'Failed to delete shopping item' });
    }
});

export default router;

