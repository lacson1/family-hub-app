import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { setCsrfCookie } from '../middleware/csrf';

const router = Router();

// Register endpoint
router.post(
    '/register',
    [
        body('name').notEmpty().trim().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            // Check if user already exists
            const existingUser = await pool.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(409).json({ error: 'Email already exists' });
            }

            // Hash the password using bcrypt
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const result = await pool.query(
                'INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, email, created_at',
                [name, email, hashedPassword]
            );

            const user = result.rows[0];

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                console.error('JWT_SECRET is not set');
                return res.status(500).json({ error: 'Server configuration error' });
            }
            const accessToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, secret, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ id: user.id, email: user.email, name: user.name, type: 'refresh' }, secret, { expiresIn: '7d' });

            res.cookie('token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 15 * 60 * 1000,
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            // Set CSRF token cookie for client
            setCsrfCookie(res);

            res.status(201).json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at,
                },
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Server error during registration' });
        }
    }
);

// Login endpoint
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const result = await pool.query(
                'SELECT id, name, email, password, created_at FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const user = result.rows[0];

            // Compare hashed password using bcrypt
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                console.error('JWT_SECRET is not set');
                return res.status(500).json({ error: 'Server configuration error' });
            }
            const accessToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, secret, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ id: user.id, email: user.email, name: user.name, type: 'refresh' }, secret, { expiresIn: '7d' });

            res.cookie('token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 15 * 60 * 1000,
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            // Set CSRF token cookie for client
            setCsrfCookie(res);

            res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error during login' });
        }
    }
);

// Logout endpoint (for session-based auth, this would clear the session)
router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.clearCookie('csrfToken', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user (requires authentication middleware in production)
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const result = await pool.query(
            'SELECT id, name, email, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;

// Refresh token endpoint (no CSRF, cookie-protected)
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        const token = req.cookies?.refreshToken;
        if (!token) return res.status(401).json({ error: 'Missing refresh token' });
        const payload = jwt.verify(token, secret) as { id: string; email: string; name?: string; type?: string };
        if (payload.type !== 'refresh') return res.status(401).json({ error: 'Invalid refresh token' });

        // rotate tokens
        const accessToken = jwt.sign({ id: payload.id, email: payload.email, name: payload.name }, secret, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ id: payload.id, email: payload.email, name: payload.name, type: 'refresh' }, secret, { expiresIn: '7d' });

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        // Optional: refresh CSRF token too
        setCsrfCookie(res);
        res.json({ success: true });
    } catch (err) {
        console.error('Refresh error:', err);
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

