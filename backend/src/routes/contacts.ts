import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';

const router = Router();

// Get all contacts with optional category filter
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM contacts';
        const values: string[] = [];

        if (category && typeof category === 'string') {
            query += ' WHERE category = $1';
            values.push(category);
        }

        query += ' ORDER BY name ASC';

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// Get favorite contacts
router.get('/favorites/all', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM contacts WHERE is_favorite = true ORDER BY name ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching favorite contacts:', error);
        res.status(500).json({ error: 'Failed to fetch favorite contacts' });
    }
});

// Get contacts by family member
router.get('/by-member/:memberId', async (req: Request, res: Response) => {
    try {
        const { memberId } = req.params;
        const result = await pool.query(
            `SELECT c.*, cfa.relationship_notes 
            FROM contacts c
            INNER JOIN contact_family_associations cfa ON c.id = cfa.contact_id
            WHERE cfa.family_member_id = $1
            ORDER BY c.name ASC`,
            [memberId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching contacts by member:', error);
        res.status(500).json({ error: 'Failed to fetch contacts by member' });
    }
});

// Get single contact
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM contacts WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ error: 'Failed to fetch contact' });
    }
});

// Get contact associations
router.get('/:id/associations', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT cfa.*, fm.name as family_member_name, fm.color as family_member_color
            FROM contact_family_associations cfa
            INNER JOIN family_members fm ON cfa.family_member_id = fm.id
            WHERE cfa.contact_id = $1
            ORDER BY fm.name ASC`,
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching contact associations:', error);
        res.status(500).json({ error: 'Failed to fetch contact associations' });
    }
});

// Create contact
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('category').isIn(['Family', 'Friends', 'Medical', 'Services', 'Emergency', 'School', 'Work', 'Other']).withMessage('Invalid category'),
        body('phone').optional().trim(),
        body('email').optional().isEmail().withMessage('Invalid email'),
        body('address').optional().trim(),
        body('company_organization').optional().trim(),
        body('job_title_specialty').optional().trim(),
        body('notes').optional().trim(),
        body('created_by').trim().notEmpty().withMessage('Created by is required'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const {
                name, category, phone, email, address,
                company_organization, job_title_specialty, notes, created_by
            } = req.body;

            const result = await pool.query(
                `INSERT INTO contacts 
                (name, category, phone, email, address, company_organization, job_title_specialty, notes, created_by) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                [name, category, phone || null, email || null, address || null,
                    company_organization || null, job_title_specialty || null, notes || null, created_by]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating contact:', error);
            res.status(500).json({ error: 'Failed to create contact' });
        }
    }
);

// Update contact
router.put(
    '/:id',
    [
        body('name').optional().trim().notEmpty(),
        body('category').optional().isIn(['Family', 'Friends', 'Medical', 'Services', 'Emergency', 'School', 'Work', 'Other']),
        body('phone').optional().trim(),
        body('email').optional().isEmail(),
        body('address').optional().trim(),
        body('company_organization').optional().trim(),
        body('job_title_specialty').optional().trim(),
        body('notes').optional().trim(),
        body('is_favorite').optional().isBoolean(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const {
                name, category, phone, email, address,
                company_organization, job_title_specialty, notes, is_favorite
            } = req.body;

            const updates = [];
            const values = [];
            let paramCount = 1;

            if (name !== undefined) {
                updates.push(`name = $${paramCount++}`);
                values.push(name);
            }
            if (category !== undefined) {
                updates.push(`category = $${paramCount++}`);
                values.push(category);
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
            if (company_organization !== undefined) {
                updates.push(`company_organization = $${paramCount++}`);
                values.push(company_organization);
            }
            if (job_title_specialty !== undefined) {
                updates.push(`job_title_specialty = $${paramCount++}`);
                values.push(job_title_specialty);
            }
            if (notes !== undefined) {
                updates.push(`notes = $${paramCount++}`);
                values.push(notes);
            }
            if (is_favorite !== undefined) {
                updates.push(`is_favorite = $${paramCount++}`);
                values.push(is_favorite);
            }

            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const result = await pool.query(
                `UPDATE contacts SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Contact not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating contact:', error);
            res.status(500).json({ error: 'Failed to update contact' });
        }
    }
);

// Toggle favorite status
router.post('/:id/favorite', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `UPDATE contacts 
            SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

// Delete contact
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// Create contact-family association
router.post(
    '/:id/associations',
    [
        body('family_member_id').notEmpty().withMessage('Family member ID is required'),
        body('relationship_notes').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { family_member_id, relationship_notes } = req.body;

            const result = await pool.query(
                `INSERT INTO contact_family_associations 
                (contact_id, family_member_id, relationship_notes) 
                VALUES ($1, $2, $3) RETURNING *`,
                [id, family_member_id, relationship_notes || null]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating association:', error);
            res.status(500).json({ error: 'Failed to create association' });
        }
    }
);

// Delete contact-family association
router.delete('/associations/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM contact_family_associations WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Association not found' });
        }

        res.json({ message: 'Association deleted successfully' });
    } catch (error) {
        console.error('Error deleting association:', error);
        res.status(500).json({ error: 'Failed to delete association' });
    }
});

export default router;

