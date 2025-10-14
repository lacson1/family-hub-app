import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
    user?: { id: string; email: string; name?: string };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        const payload = jwt.verify(token, secret) as { id: string; email: string; name?: string };
        req.user = { id: payload.id, email: payload.email, name: payload.name };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export type { AuthenticatedRequest };


