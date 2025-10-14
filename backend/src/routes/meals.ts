import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';

const router = Router();

// Get all meals
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM meals ORDER BY date ASC, meal_type ASC, created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching meals:', error);
        res.status(500).json({ error: 'Failed to fetch meals' });
    }
});

// Get single meal
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM meals WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching meal:', error);
        res.status(500).json({ error: 'Failed to fetch meal' });
    }
});

// Create meal
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('meal_type').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
        body('date').isDate().withMessage('Valid date is required'),
        body('created_by').trim().notEmpty().withMessage('Created by is required'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const {
                name, meal_type, date, notes, prep_time, cook_time, servings,
                ingredients, instructions, photo_url, is_favorite, is_template,
                tags, created_by
            } = req.body;

            const result = await pool.query(
                `INSERT INTO meals (
                    name, meal_type, date, notes, prep_time, cook_time, servings,
                    ingredients, instructions, photo_url, is_favorite, is_template,
                    tags, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
                [
                    name, meal_type, date, notes || null, prep_time || null, cook_time || null,
                    servings || 4, JSON.stringify(ingredients || []), instructions || null,
                    photo_url || null, is_favorite || false, is_template || false,
                    tags || null, created_by
                ]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating meal:', error);
            res.status(500).json({ error: 'Failed to create meal' });
        }
    }
);

// Update meal
router.put(
    '/:id',
    [
        body('name').optional().trim().notEmpty(),
        body('meal_type').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack']),
        body('date').optional().isDate(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const {
                name, meal_type, date, notes, prep_time, cook_time, servings,
                ingredients, instructions, photo_url, is_favorite, is_template, tags
            } = req.body;

            const updates = [];
            const values = [];
            let paramCount = 1;

            if (name !== undefined) {
                updates.push(`name = $${paramCount++}`);
                values.push(name);
            }
            if (meal_type !== undefined) {
                updates.push(`meal_type = $${paramCount++}`);
                values.push(meal_type);
            }
            if (date !== undefined) {
                updates.push(`date = $${paramCount++}`);
                values.push(date);
            }
            if (notes !== undefined) {
                updates.push(`notes = $${paramCount++}`);
                values.push(notes);
            }
            if (prep_time !== undefined) {
                updates.push(`prep_time = $${paramCount++}`);
                values.push(prep_time);
            }
            if (cook_time !== undefined) {
                updates.push(`cook_time = $${paramCount++}`);
                values.push(cook_time);
            }
            if (servings !== undefined) {
                updates.push(`servings = $${paramCount++}`);
                values.push(servings);
            }
            if (ingredients !== undefined) {
                updates.push(`ingredients = $${paramCount++}`);
                values.push(JSON.stringify(ingredients));
            }
            if (instructions !== undefined) {
                updates.push(`instructions = $${paramCount++}`);
                values.push(instructions);
            }
            if (photo_url !== undefined) {
                updates.push(`photo_url = $${paramCount++}`);
                values.push(photo_url);
            }
            if (is_favorite !== undefined) {
                updates.push(`is_favorite = $${paramCount++}`);
                values.push(is_favorite);
            }
            if (is_template !== undefined) {
                updates.push(`is_template = $${paramCount++}`);
                values.push(is_template);
            }
            if (tags !== undefined) {
                updates.push(`tags = $${paramCount++}`);
                values.push(tags);
            }

            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const result = await pool.query(
                `UPDATE meals SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Meal not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating meal:', error);
            res.status(500).json({ error: 'Failed to update meal' });
        }
    }
);

// Delete meal
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM meals WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        res.json({ message: 'Meal deleted successfully' });
    } catch (error) {
        console.error('Error deleting meal:', error);
        res.status(500).json({ error: 'Failed to delete meal' });
    }
});

// Get favorite meals (templates)
router.get('/favorites/all', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM meals WHERE is_favorite = true OR is_template = true ORDER BY name ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// Add meal ingredients to shopping list
router.post('/:id/add-to-shopping', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { added_by } = req.body;

        // Get the meal
        const mealResult = await pool.query('SELECT * FROM meals WHERE id = $1', [id]);
        if (mealResult.rows.length === 0) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        const meal = mealResult.rows[0];
        const ingredients = meal.ingredients || [];

        if (ingredients.length === 0) {
            return res.status(400).json({ error: 'No ingredients to add' });
        }

        // Add each ingredient as a shopping item
        const addedItems = [];
        for (const ingredient of ingredients) {
            const result = await pool.query(
                'INSERT INTO shopping_items (name, quantity, category, notes, added_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [
                    ingredient.name,
                    `${ingredient.amount}${ingredient.unit ? ' ' + ingredient.unit : ''}`,
                    'Groceries',
                    `For: ${meal.name}`,
                    added_by || 'System'
                ]
            );
            addedItems.push(result.rows[0]);
        }

        res.json({
            message: `Added ${addedItems.length} items to shopping list`,
            items: addedItems
        });
    } catch (error) {
        console.error('Error adding to shopping list:', error);
        res.status(500).json({ error: 'Failed to add to shopping list' });
    }
});

export default router;
