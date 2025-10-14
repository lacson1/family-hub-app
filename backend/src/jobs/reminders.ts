import cron from 'node-cron';
import pool from '../database/db';
import {
    sendTaskDueNotification,
    sendEventStartingNotification,
    sendMealPrepReminderNotification,
    sendBudgetAlertNotification
} from '../services/pushNotifications';

// Track sent reminders to avoid duplicates
const sentReminders = new Set<string>();

// Clear sent reminders cache every day
cron.schedule('0 0 * * *', () => {
    sentReminders.clear();
    console.log('Cleared sent reminders cache');
});

// Check for tasks due soon (every 15 minutes)
const checkTaskReminders = async (): Promise<void> => {
    try {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Tasks due in 1 hour
        const oneHourTasks = await pool.query(
            `SELECT id, title, assigned_to, due_date 
            FROM tasks 
            WHERE completed = false 
            AND due_date = $1
            AND EXTRACT(HOUR FROM NOW()) + 1 = EXTRACT(HOUR FROM NOW())`,
            [oneHourFromNow.toISOString().split('T')[0]]
        );

        for (const task of oneHourTasks.rows) {
            const reminderId = `task-1h-${task.id}`;
            if (!sentReminders.has(reminderId)) {
                await sendTaskDueNotification(task.assigned_to, task.title, 'in 1 hour');

                // Also create in-app notification
                await pool.query(
                    `INSERT INTO notifications (user_id, title, message, type, category, related_id)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        task.assigned_to,
                        'Task Due Soon',
                        `"${task.title}" is due in 1 hour`,
                        'warning',
                        'task',
                        task.id
                    ]
                );

                sentReminders.add(reminderId);
                console.log(`Sent 1-hour reminder for task: ${task.title}`);
            }
        }

        // Tasks due tomorrow
        const tomorrowTasks = await pool.query(
            `SELECT id, title, assigned_to, due_date 
            FROM tasks 
            WHERE completed = false 
            AND due_date = $1`,
            [oneDayFromNow.toISOString().split('T')[0]]
        );

        for (const task of tomorrowTasks.rows) {
            const reminderId = `task-1d-${task.id}`;
            if (!sentReminders.has(reminderId)) {
                await sendTaskDueNotification(task.assigned_to, task.title, 'tomorrow');

                // Also create in-app notification
                await pool.query(
                    `INSERT INTO notifications (user_id, title, message, type, category, related_id)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        task.assigned_to,
                        'Task Due Tomorrow',
                        `"${task.title}" is due tomorrow`,
                        'info',
                        'task',
                        task.id
                    ]
                );

                sentReminders.add(reminderId);
                console.log(`Sent 1-day reminder for task: ${task.title}`);
            }
        }
    } catch (error) {
        console.error('Error checking task reminders:', error);
    }
};

// Check for events starting soon (every 15 minutes)
const checkEventReminders = async (): Promise<void> => {
    try {
        const now = new Date();
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        // Events starting in 30 minutes
        const events30Min = await pool.query(
            `SELECT id, title, date, time 
            FROM events 
            WHERE date = $1 
            AND time BETWEEN $2 AND $3`,
            [
                now.toISOString().split('T')[0],
                now.toTimeString().split(' ')[0],
                thirtyMinutesFromNow.toTimeString().split(' ')[0]
            ]
        );

        for (const event of events30Min.rows) {
            const reminderId = `event-30m-${event.id}`;
            if (!sentReminders.has(reminderId)) {
                // For now, send to all family members (in production, use event participants)
                const members = await pool.query('SELECT DISTINCT name FROM family_members');

                for (const member of members.rows) {
                    await sendEventStartingNotification(member.name, event.title, 'in 30 minutes');

                    await pool.query(
                        `INSERT INTO notifications (user_id, title, message, type, category, related_id)
                        VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            member.name,
                            'Event Starting Soon',
                            `"${event.title}" starts in 30 minutes`,
                            'warning',
                            'event',
                            event.id
                        ]
                    );
                }

                sentReminders.add(reminderId);
                console.log(`Sent 30-minute reminder for event: ${event.title}`);
            }
        }
    } catch (error) {
        console.error('Error checking event reminders:', error);
    }
};

// Check for meal prep reminders (every 15 minutes)
const checkMealReminders = async (): Promise<void> => {
    try {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        // Meals scheduled for 1 hour from now
        const meals = await pool.query(
            `SELECT id, name, date, created_by, prep_time 
            FROM meals 
            WHERE date = $1`,
            [now.toISOString().split('T')[0]]
        );

        for (const meal of meals.rows) {
            const reminderId = `meal-prep-${meal.id}`;
            if (!sentReminders.has(reminderId)) {
                await sendMealPrepReminderNotification(
                    meal.created_by,
                    meal.name,
                    meal.prep_time || '1 hour'
                );

                await pool.query(
                    `INSERT INTO notifications (user_id, title, message, type, category, related_id)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        meal.created_by,
                        'Meal Prep Reminder',
                        `Time to start preparing "${meal.name}"`,
                        'info',
                        'meal',
                        meal.id
                    ]
                );

                sentReminders.add(reminderId);
                console.log(`Sent meal prep reminder: ${meal.name}`);
            }
        }
    } catch (error) {
        console.error('Error checking meal reminders:', error);
    }
};

// Check budget alerts (once per day at 9 AM)
const checkBudgetAlerts = async (): Promise<void> => {
    try {
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        const budgets = await pool.query(
            `SELECT 
                b.category,
                b.amount as budget_amount,
                b.created_by,
                COALESCE(SUM(t.amount), 0) as spent_amount
            FROM budgets b
            LEFT JOIN transactions t ON t.category = b.category 
                AND t.type = 'expense' 
                AND t.date >= $1
            WHERE b.period = 'monthly'
            GROUP BY b.id, b.category, b.amount, b.created_by
            HAVING COALESCE(SUM(t.amount), 0) / b.amount >= 0.8`,
            [monthStartStr]
        );

        for (const budget of budgets.rows) {
            const percentage = Math.round(
                (parseFloat(budget.spent_amount) / parseFloat(budget.budget_amount)) * 100
            );

            const reminderId = `budget-${budget.category}-${Math.floor(percentage / 10) * 10}`;
            if (!sentReminders.has(reminderId)) {
                await sendBudgetAlertNotification(budget.created_by, budget.category, percentage);

                const status = percentage >= 100 ? 'exceeded' : 'approaching';
                await pool.query(
                    `INSERT INTO notifications (user_id, title, message, type, category)
                    VALUES ($1, $2, $3, $4, $5)`,
                    [
                        budget.created_by,
                        'Budget Alert',
                        `You've ${status} your ${budget.category} budget (${percentage}%)`,
                        percentage >= 100 ? 'error' : 'warning',
                        'general'
                    ]
                );

                sentReminders.add(reminderId);
                console.log(`Sent budget alert for ${budget.category}: ${percentage}%`);
            }
        }
    } catch (error) {
        console.error('Error checking budget alerts:', error);
    }
};

// Start all reminder cron jobs
export const startReminderJobs = (): void => {
    // Check tasks and events every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        console.log('Running reminder checks...');
        checkTaskReminders();
        checkEventReminders();
        checkMealReminders();
    });

    // Check budgets once per day at 9 AM
    cron.schedule('0 9 * * *', () => {
        console.log('Running budget checks...');
        checkBudgetAlerts();
    });

    console.log('✅ Reminder jobs scheduled');
};

