import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { requireFamily, type FamilyRequest } from '../middleware/family';
import crypto from 'crypto';

const router = Router();

// Create a new family
router.post(
  '/',
  requireAuth,
  [body('name').trim().notEmpty().withMessage('Family name is required')],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name } = req.body as { name: string };

      const result = await pool.query(
        'INSERT INTO families (name, created_by) VALUES ($1, $2) RETURNING *',
        [name, req.user!.id]
      );
      const family = result.rows[0];

      await pool.query(
        'INSERT INTO user_families (user_id, family_id, role) VALUES ($1, $2, $3)',
        [req.user!.id, family.id, 'owner']
      );

      res.status(201).json(family);
    } catch (error) {
      console.error('Error creating family:', error);
      res.status(500).json({ error: 'Failed to create family' });
    }
  }
);

// List families the user belongs to
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT f.* , uf.role FROM families f
       JOIN user_families uf ON uf.family_id = f.id
       WHERE uf.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing families:', error);
    res.status(500).json({ error: 'Failed to list families' });
  }
});

// Create an invite
router.post(
  '/invite',
  requireAuth,
  requireFamily,
  [body('email').isEmail().normalizeEmail(), body('role').optional().isIn(['admin', 'member'])],
  async (req: FamilyRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { email, role } = req.body as { email: string; role?: 'admin' | 'member' };
      const code = crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await pool.query(
        `INSERT INTO family_invites (family_id, email, role, code, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.familyId!, email, role || 'member', code, expiresAt]
      );

      res.status(201).json({ code, expires_at: expiresAt.toISOString() });
    } catch (error) {
      console.error('Error creating invite:', error);
      res.status(500).json({ error: 'Failed to create invite' });
    }
  }
);

// Accept invite by code
router.post(
  '/accept',
  requireAuth,
  [body('code').trim().notEmpty()],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { code } = req.body as { code: string };

      const inviteRes = await client.query(
        `SELECT * FROM family_invites WHERE code = $1 AND status = 'pending' AND (expires_at IS NULL OR expires_at > NOW())`,
        [code]
      );
      if (inviteRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid or expired invite' });
      }
      const invite = inviteRes.rows[0];

      await client.query(
        `INSERT INTO user_families (user_id, family_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, family_id) DO NOTHING`,
        [req.user!.id, invite.family_id, invite.role]
      );

      await client.query(`UPDATE family_invites SET status = 'accepted' WHERE id = $1`, [invite.id]);
      await client.query('COMMIT');
      res.json({ success: true, family_id: invite.family_id });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error accepting invite:', error);
      res.status(500).json({ error: 'Failed to accept invite' });
    } finally {
      client.release();
    }
  }
);

export default router;


