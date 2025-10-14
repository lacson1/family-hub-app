import pool from '../database/db';
import cron from 'node-cron';

/**
 * Check for due event reminders and send notifications
 */
export async function checkEventReminders() {
    try {
        const now = new Date();

        // Get all reminders that are due and not yet sent
        const result = await pool.query(
            `SELECT 
        er.id as reminder_id,
        er.event_id,
        er.reminder_type,
        e.title,
        e.date,
        e.time,
        e.location,
        e.created_by
       FROM event_reminders er
       JOIN events e ON er.event_id = e.id
       WHERE er.remind_at <= $1 
       AND er.sent = FALSE
       ORDER BY er.remind_at ASC`,
            [now]
        );

        const reminders = result.rows;

        if (reminders.length === 0) {
            return;
        }

        console.log(`Processing ${reminders.length} event reminders...`);

        for (const reminder of reminders) {
            try {
                // Create notification
                const eventDate = new Date(reminder.date);
                const formattedDate = eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });

                const timeText = reminder.time
                    ? ` at ${reminder.time}`
                    : ' (all day)';

                const locationText = reminder.location
                    ? ` at ${reminder.location}`
                    : '';

                const message = `Upcoming event: ${reminder.title} on ${formattedDate}${timeText}${locationText}`;

                // Insert notification
                await pool.query(
                    `INSERT INTO notifications (user_id, title, message, type, category, related_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        reminder.created_by || 'system',
                        '🔔 Event Reminder',
                        message,
                        'info',
                        'event',
                        reminder.event_id
                    ]
                );

                // Mark reminder as sent
                await pool.query(
                    'UPDATE event_reminders SET sent = TRUE WHERE id = $1',
                    [reminder.reminder_id]
                );

                console.log(`✓ Sent reminder for event: ${reminder.title}`);
            } catch (error) {
                console.error(`Error processing reminder ${reminder.reminder_id}:`, error);
            }
        }

        console.log(`Processed ${reminders.length} event reminders successfully`);
    } catch (error) {
        console.error('Error checking event reminders:', error);
    }
}

/**
 * Start the event reminders cron job
 * Runs every minute to check for due reminders
 */
export function startEventRemindersCron() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        await checkEventReminders();
    });

    console.log('✓ Event reminders cron job started (runs every minute)');
}

/**
 * Generate recurring event instances
 * This function creates child events based on recurring rules
 */
export async function generateRecurringEvents() {
    try {
        const threeMonthsAhead = new Date();
        threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

        // Get all parent events with recurring rules
        const result = await pool.query(
            `SELECT * FROM events 
       WHERE recurring_rule IS NOT NULL 
       AND parent_event_id IS NULL
       AND date <= $1`,
            [threeMonthsAhead]
        );

        const parentEvents = result.rows;

        for (const parent of parentEvents) {
            try {
                const rule = parent.recurring_rule;
                if (!rule || !rule.frequency) continue;

                const startDate = new Date(parent.date);
                const endDate = rule.end_date ? new Date(rule.end_date) : threeMonthsAhead;
                const interval = rule.interval || 1;

                const currentDate = new Date(startDate);
                let count = 0;
                const maxCount = rule.count || 100; // Limit to prevent infinite loops

                // Check what instances already exist
                const existingResult = await pool.query(
                    'SELECT date FROM events WHERE parent_event_id = $1',
                    [parent.id]
                );
                const existingDates = new Set(existingResult.rows.map(r => r.date));

                while (currentDate <= endDate && count < maxCount) {
                    // Move to next occurrence based on frequency
                    switch (rule.frequency) {
                        case 'daily':
                            currentDate.setDate(currentDate.getDate() + interval);
                            break;
                        case 'weekly':
                            currentDate.setDate(currentDate.getDate() + (7 * interval));
                            break;
                        case 'monthly':
                            currentDate.setMonth(currentDate.getMonth() + interval);
                            break;
                        case 'yearly':
                            currentDate.setFullYear(currentDate.getFullYear() + interval);
                            break;
                    }

                    if (currentDate > endDate) break;

                    const instanceDate = currentDate.toISOString().split('T')[0];

                    // Skip if instance already exists
                    if (existingDates.has(instanceDate)) {
                        count++;
                        continue;
                    }

                    // Create recurring instance
                    await pool.query(
                        `INSERT INTO events (
              title, date, time, end_time, all_day, type, description, 
              location, created_by, google_event_id, reminder_minutes, 
              parent_event_id, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                        [
                            parent.title,
                            instanceDate,
                            parent.time,
                            parent.end_time,
                            parent.all_day,
                            parent.type,
                            parent.description,
                            parent.location,
                            parent.created_by,
                            parent.google_event_id,
                            parent.reminder_minutes,
                            parent.id
                        ]
                    );

                    // Create reminder for the instance if needed
                    if (parent.reminder_minutes) {
                        const eventDateTime = parent.all_day
                            ? new Date(instanceDate)
                            : new Date(`${instanceDate}T${parent.time}`);
                        const remindAt = new Date(eventDateTime.getTime() - (parent.reminder_minutes * 60 * 1000));

                        await pool.query(
                            `INSERT INTO event_reminders (event_id, remind_at, reminder_type)
               SELECT id, $1, 'notification' FROM events 
               WHERE parent_event_id = $2 AND date = $3`,
                            [remindAt, parent.id, instanceDate]
                        );
                    }

                    count++;
                }

                if (count > 0) {
                    console.log(`✓ Generated ${count} instances for recurring event: ${parent.title}`);
                }
            } catch (error) {
                console.error(`Error generating instances for event ${parent.id}:`, error);
            }
        }
    } catch (error) {
        console.error('Error generating recurring events:', error);
    }
}

/**
 * Start the recurring events generation cron job
 * Runs daily at midnight to generate upcoming recurring event instances
 */
export function startRecurringEventsCron() {
    // Run daily at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running recurring events generation...');
        await generateRecurringEvents();
    });

    // Also run once on startup
    generateRecurringEvents();

    console.log('✓ Recurring events cron job started (runs daily at midnight)');
}

