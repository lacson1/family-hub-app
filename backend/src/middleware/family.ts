import { Request, Response, NextFunction } from 'express';
import pool from '../database/db';
import { AuthenticatedRequest } from './auth';

export interface FamilyRequest extends AuthenticatedRequest {
    familyId?: string;
}

export const requireFamily = async (req: FamilyRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Not authenticated' });

        const activeFamilyId = req.cookies?.activeFamilyId || (req.headers['x-family-id'] as string | undefined);
        if (!activeFamilyId) return res.status(400).json({ error: 'Active family not selected' });

        // Verify membership
        const result = await pool.query(
            'SELECT 1 FROM user_families WHERE user_id = $1 AND family_id = $2 LIMIT 1',
            [req.user.id, activeFamilyId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ error: 'Not a member of this family' });
        }

        req.familyId = activeFamilyId;
        next();
    } catch (err) {
        console.error('requireFamily error:', err);
        res.status(500).json({ error: 'Server error validating family' });
    }
};


