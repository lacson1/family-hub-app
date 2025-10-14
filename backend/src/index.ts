import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
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
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/events', eventsRouter);
app.use('/api/family-members', familyMembersRouter);
app.use('/api/shopping-items', shoppingItemsRouter);
app.use('/api/meals', mealsRouter);
app.use('/api/family-relationships', familyRelationshipsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/notifications-test', notificationsTestRouter);
app.use('/api/notification-preferences', notificationPreferencesRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/activity-log', activityLogRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/push', pushRouter);

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

