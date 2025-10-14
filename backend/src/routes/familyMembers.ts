import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';

const router = Router();

// Get all family members
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM family_members ORDER BY created_at ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching family members:', error);
        res.status(500).json({ error: 'Failed to fetch family members' });
    }
});

// Get single family member
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM family_members WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Family member not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching family member:', error);
        res.status(500).json({ error: 'Failed to fetch family member' });
    }
});

// Create family member
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('role').trim().notEmpty().withMessage('Role is required'),
        body('color').trim().notEmpty().withMessage('Color is required'),
        body('avatar_url').optional().trim(),
        body('avatar_pattern').optional().trim(),
        body('birth_date').optional({ nullable: true, checkFalsy: true }).isISO8601(),
        body('phone').optional().trim(),
        body('email').optional({ nullable: true, checkFalsy: true }).trim().isEmail(),
        body('address').optional().trim(),
        body('notes').optional().trim(),
        body('generation').optional().isInt(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const {
                name, role, color, avatar_url, avatar_pattern,
                birth_date, phone, email, address, notes, generation
            } = req.body;

            const result = await pool.query(
                `INSERT INTO family_members 
                (name, role, color, avatar_url, avatar_pattern, birth_date, phone, email, address, notes, generation) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
                [name, role, color, avatar_url || null, avatar_pattern || 'solid',
                    birth_date || null, phone || null, email || null, address || null,
                    notes || null, generation || 0]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating family member:', error);
            res.status(500).json({ error: 'Failed to create family member' });
        }
    }
);

// Update family member
router.put(
    '/:id',
    [
        body('name').optional().trim().notEmpty(),
        body('role').optional().trim().notEmpty(),
        body('color').optional().trim().notEmpty(),
        body('avatar_url').optional().trim(),
        body('avatar_pattern').optional().trim(),
        body('birth_date').optional({ nullable: true, checkFalsy: true }).isISO8601(),
        body('phone').optional().trim(),
        body('email').optional({ nullable: true, checkFalsy: true }).trim().isEmail(),
        body('address').optional().trim(),
        body('notes').optional().trim(),
        body('generation').optional().isInt(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const {
                name, role, color, avatar_url, avatar_pattern,
                birth_date, phone, email, address, notes, generation
            } = req.body;

            const updates = [];
            const values = [];
            let paramCount = 1;

            if (name !== undefined) {
                updates.push(`name = $${paramCount++}`);
                values.push(name);
            }
            if (role !== undefined) {
                updates.push(`role = $${paramCount++}`);
                values.push(role);
            }
            if (color !== undefined) {
                updates.push(`color = $${paramCount++}`);
                values.push(color);
            }
            if (avatar_url !== undefined) {
                updates.push(`avatar_url = $${paramCount++}`);
                values.push(avatar_url);
            }
            if (avatar_pattern !== undefined) {
                updates.push(`avatar_pattern = $${paramCount++}`);
                values.push(avatar_pattern);
            }
            if (birth_date !== undefined) {
                updates.push(`birth_date = $${paramCount++}`);
                values.push(birth_date);
            }
            if (phone !== undefined) {
                updates.push(`phone = $${paramCount++}`);
                values.push(phone);
            }
            if (email !== undefined) {
                updates.push(`email = $${paramCount++}`);
                values.push(email);
            }
            if (address !== undefined) {
                updates.push(`address = $${paramCount++}`);
                values.push(address);
            }
            if (notes !== undefined) {
                updates.push(`notes = $${paramCount++}`);
                values.push(notes);
            }
            if (generation !== undefined) {
                updates.push(`generation = $${paramCount++}`);
                values.push(generation);
            }

            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const result = await pool.query(
                `UPDATE family_members SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Family member not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating family member:', error);
            res.status(500).json({ error: 'Failed to update family member' });
        }
    }
);

// Delete family member
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM family_members WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Family member not found' });
        }

        res.json({ message: 'Family member deleted successfully' });
    } catch (error) {
        console.error('Error deleting family member:', error);
        res.status(500).json({ error: 'Failed to delete family member' });
    }
});

export default router;

