import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import cookieParser from 'cookie-parser';
import pool from './database/db';
import bcrypt from 'bcryptjs';
import { requireAuth } from './middleware/auth';
import { requireCsrf } from './middleware/csrf';
import { initDatabase } from './database/init';
import { wsManager } from './realtime/websocket';
import { startReminderJobs } from './jobs/reminders';
import { startRecurringTaskJobs } from './jobs/recurringTasks';
import { startEventRemindersCron, startRecurringEventsCron } from './jobs/eventReminders';
import tasksRouter from './routes/tasks';
import eventsRouter from './routes/events';
import familyMembersRouter from './routes/familyMembers';
import shoppingItemsRouter from './routes/shoppingItems';
import mealsRouter from './routes/meals';
import familyRelationshipsRouter from './routes/familyRelationships';
import transactionsRouter from './routes/transactions';
import budgetsRouter from './routes/budgets';
import notificationsRouter from './routes/notifications';
import notificationsTestRouter from './routes/notifications-test';
import notificationPreferencesRouter from './routes/notification-preferences';
import contactsRouter from './routes/contacts';
import authRouter from './routes/auth';
import messagesRouter from './routes/messages';
import activityLogRouter from './routes/activityLog';
import dashboardRouter from './routes/dashboard';
import analyticsRouter from './routes/analytics';
import uploadRouter from './routes/upload';
import pushRouter from './routes/push';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:5173', 'https://family-hub-app-t7ea.vercel.app'],
    credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/tasks', requireAuth, requireCsrf, tasksRouter);
app.use('/api/events', requireAuth, requireCsrf, eventsRouter);
app.use('/api/family-members', requireAuth, requireCsrf, familyMembersRouter);
app.use('/api/shopping-items', requireAuth, requireCsrf, shoppingItemsRouter);
app.use('/api/meals', requireAuth, requireCsrf, mealsRouter);
app.use('/api/family-relationships', requireAuth, requireCsrf, familyRelationshipsRouter);
app.use('/api/transactions', requireAuth, requireCsrf, transactionsRouter);
app.use('/api/budgets', requireAuth, requireCsrf, budgetsRouter);
app.use('/api/notifications', requireAuth, requireCsrf, notificationsRouter);
app.use('/api/notifications-test', notificationsTestRouter);
app.use('/api/notification-preferences', requireAuth, notificationPreferencesRouter);
app.use('/api/contacts', requireAuth, requireCsrf, contactsRouter);
app.use('/api/auth', authRouter);
app.use('/api/messages', requireAuth, requireCsrf, messagesRouter);
app.use('/api/activity-log', requireAuth, requireCsrf, activityLogRouter);
app.use('/api/dashboard', requireAuth, requireCsrf, dashboardRouter);
app.use('/api/analytics', requireAuth, requireCsrf, analyticsRouter);
app.use('/api/upload', requireAuth, requireCsrf, uploadRouter);
app.use('/api/push', requireAuth, requireCsrf, pushRouter);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Initialize database and start server
const startServer = async () => {
    try {
        await initDatabase();
        console.log('Database initialized successfully');

        // Optionally seed demo user
        const demoEmail = process.env.DEMO_USER_EMAIL || 'demo@familyhub.com';
        const demoPassword = process.env.DEMO_USER_PASSWORD || 'demo123';
        const demoName = process.env.DEMO_USER_NAME || 'Demo User';
        try {
            const existing = await pool.query('SELECT id FROM users WHERE email = $1', [demoEmail]);
            if (existing.rows.length === 0) {
                const hashed = await bcrypt.hash(demoPassword, 10);
                await pool.query(
                    'INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, NOW())',
                    [demoName, demoEmail, hashed]
                );
                console.log('Seeded demo user');
            } else {
                console.log('Demo user already exists');
            }
        } catch (seedErr) {
            console.warn('Demo user seed skipped/failed:', seedErr);
        }

        // Create HTTP server
        const server = http.createServer(app);

        // Initialize WebSocket server
        wsManager.initialize(server);
        console.log('WebSocket server initialized');

        // Start cron jobs
        startReminderJobs();
        startRecurringTaskJobs();
        startEventRemindersCron();
        startRecurringEventsCron();
        console.log('Cron jobs started');

        // Start server
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            wsManager.close();
            server.close(() => {
                console.log('HTTP server closed');
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

