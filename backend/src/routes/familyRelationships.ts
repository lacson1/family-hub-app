import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';

const router = Router();

// Get all relationships with family member names
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                fr.id,
                fr.person_id,
                fr.related_person_id,
                fr.relationship_type,
                fr.created_at,
                fr.updated_at,
                fm1.name as person_name,
                fm1.color as person_color,
                fm2.name as related_person_name,
                fm2.color as related_person_color
            FROM family_relationships fr
            JOIN family_members fm1 ON fr.person_id = fm1.id
            JOIN family_members fm2 ON fr.related_person_id = fm2.id
            ORDER BY fr.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching family relationships:', error);
        res.status(500).json({ error: 'Failed to fetch family relationships' });
    }
});

// Get relationships for a specific person
router.get('/person/:personId', async (req: Request, res: Response) => {
    try {
        const { personId } = req.params;
        const result = await pool.query(`
            SELECT 
                fr.id,
                fr.person_id,
                fr.related_person_id,
                fr.relationship_type,
                fr.created_at,
                fr.updated_at,
                fm1.name as person_name,
                fm1.color as person_color,
                fm2.name as related_person_name,
                fm2.color as related_person_color
            FROM family_relationships fr
            JOIN family_members fm1 ON fr.person_id = fm1.id
            JOIN family_members fm2 ON fr.related_person_id = fm2.id
            WHERE fr.person_id = $1 OR fr.related_person_id = $1
            ORDER BY fr.created_at DESC
        `, [personId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching person relationships:', error);
        res.status(500).json({ error: 'Failed to fetch person relationships' });
    }
});

// Create relationship
router.post(
    '/',
    [
        body('person_id').isUUID().withMessage('Valid person ID is required'),
        body('related_person_id').isUUID().withMessage('Valid related person ID is required'),
        body('relationship_type').isIn(['parent', 'child', 'spouse', 'sibling']).withMessage('Invalid relationship type'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { person_id, related_person_id, relationship_type } = req.body;

            // Check if both family members exist
            const memberCheck = await pool.query(
                'SELECT id FROM family_members WHERE id IN ($1, $2)',
                [person_id, related_person_id]
            );

            if (memberCheck.rows.length !== 2) {
                return res.status(400).json({ error: 'One or both family members not found' });
            }

            const result = await pool.query(
                'INSERT INTO family_relationships (person_id, related_person_id, relationship_type) VALUES ($1, $2, $3) RETURNING *',
                [person_id, related_person_id, relationship_type]
            );

            // Fetch with names
            const fullResult = await pool.query(`
                SELECT 
                    fr.id,
                    fr.person_id,
                    fr.related_person_id,
                    fr.relationship_type,
                    fr.created_at,
                    fr.updated_at,
                    fm1.name as person_name,
                    fm1.color as person_color,
                    fm2.name as related_person_name,
                    fm2.color as related_person_color
                FROM family_relationships fr
                JOIN family_members fm1 ON fr.person_id = fm1.id
                JOIN family_members fm2 ON fr.related_person_id = fm2.id
                WHERE fr.id = $1
            `, [result.rows[0].id]);

            res.status(201).json(fullResult.rows[0]);
        } catch (error: any) {
            console.error('Error creating family relationship:', error);
            if (error.code === '23505') { // Unique constraint violation
                res.status(400).json({ error: 'This relationship already exists' });
            } else {
                res.status(500).json({ error: 'Failed to create family relationship' });
            }
        }
    }
);

// Update relationship
router.put(
    '/:id',
    [
        body('relationship_type').isIn(['parent', 'child', 'spouse', 'sibling']).withMessage('Invalid relationship type'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { relationship_type } = req.body;

            const result = await pool.query(
                'UPDATE family_relationships SET relationship_type = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
                [relationship_type, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Family relationship not found' });
            }

            // Fetch with names
            const fullResult = await pool.query(`
                SELECT 
                    fr.id,
                    fr.person_id,
                    fr.related_person_id,
                    fr.relationship_type,
                    fr.created_at,
                    fr.updated_at,
                    fm1.name as person_name,
                    fm1.color as person_color,
                    fm2.name as related_person_name,
                    fm2.color as related_person_color
                FROM family_relationships fr
                JOIN family_members fm1 ON fr.person_id = fm1.id
                JOIN family_members fm2 ON fr.related_person_id = fm2.id
                WHERE fr.id = $1
            `, [id]);

            res.json(fullResult.rows[0]);
        } catch (error) {
            console.error('Error updating family relationship:', error);
            res.status(500).json({ error: 'Failed to update family relationship' });
        }
    }
);

// Delete relationship
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM family_relationships WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Family relationship not found' });
        }

        res.json({ message: 'Family relationship deleted successfully' });
    } catch (error) {
        console.error('Error deleting family relationship:', error);
        res.status(500).json({ error: 'Failed to delete family relationship' });
    }
});

export default router;
