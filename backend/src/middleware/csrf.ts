import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';

export const generateCsrfToken = () => crypto.randomBytes(24).toString('hex');

export const setCsrfCookie = (res: Response) => {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // must be readable by frontend
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return token;
};

// Require CSRF token for unsafe methods
export const requireCsrf = (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = (req.headers[CSRF_HEADER_NAME] as string) || '';
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ error: 'CSRF token invalid or missing' });
    }
    return next();
};


