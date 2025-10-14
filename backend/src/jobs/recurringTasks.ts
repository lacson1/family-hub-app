import cron from 'node-cron';
import pool from '../database/db';

interface RecurrenceRule {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

// Generate future task instances from recurring rules
const generateRecurringTaskInstances = async (): Promise<void> => {
    try {
        const today = new Date();
        const threeMonthsFromNow = new Date(today);
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

        // Get parent tasks with recurrence rules
        const parentTasks = await pool.query(
            `SELECT * FROM tasks 
            WHERE recurring_rule IS NOT NULL 
            AND parent_task_id IS NULL`
        );

        for (const parentTask of parentTasks.rows) {
            const rule: RecurrenceRule = parentTask.recurring_rule;

            // Check if we need to generate more instances
            const lastInstance = await pool.query(
                `SELECT MAX(due_date) as last_date 
                FROM tasks 
                WHERE parent_task_id = $1`,
                [parentTask.id]
            );

            const currentDate = lastInstance.rows[0]?.last_date
                ? new Date(lastInstance.rows[0].last_date)
                : new Date(parentTask.due_date);

            const endDate = rule.endDate ? new Date(rule.endDate) : threeMonthsFromNow;

            // Generate instances up to 3 months from now or end date
            const instancesToCreate = [];

            while (currentDate < threeMonthsFromNow && currentDate < endDate) {
                // Calculate next occurrence based on frequency
                switch (rule.frequency) {
                    case 'daily':
                        currentDate.setDate(currentDate.getDate() + rule.interval);
                        break;
                    case 'weekly':
                        currentDate.setDate(currentDate.getDate() + (7 * rule.interval));

                        // If days of week specified, adjust to match
                        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
                            const currentDay = currentDate.getDay();
                            const nextDay = rule.daysOfWeek.find(day => day > currentDay) || rule.daysOfWeek[0];
                            const daysToAdd = nextDay > currentDay
                                ? nextDay - currentDay
                                : 7 - currentDay + nextDay;
                            currentDate.setDate(currentDate.getDate() + daysToAdd);
                        }
                        break;
                    case 'monthly':
                        currentDate.setMonth(currentDate.getMonth() + rule.interval);
                        break;
                }

                if (currentDate < threeMonthsFromNow && currentDate < endDate) {
                    instancesToCreate.push({
                        ...parentTask,
                        due_date: currentDate.toISOString().split('T')[0],
                        parent_task_id: parentTask.id,
                        completed: false
                    });
                }
            }

            // Insert new instances
            for (const instance of instancesToCreate) {
                // Check if instance already exists
                const exists = await pool.query(
                    `SELECT id FROM tasks 
                    WHERE parent_task_id = $1 AND due_date = $2`,
                    [parentTask.id, instance.due_date]
                );

                if (exists.rows.length === 0) {
                    await pool.query(
                        `INSERT INTO tasks 
                        (title, assigned_to, due_date, priority, completed, parent_task_id, recurring_rule)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            instance.title,
                            instance.assigned_to,
                            instance.due_date,
                            instance.priority,
                            false,
                            parentTask.id,
                            JSON.stringify(rule)
                        ]
                    );
                    console.log(`Created recurring task instance: ${instance.title} on ${instance.due_date}`);
                }
            }
        }
    } catch (error) {
        console.error('Error generating recurring task instances:', error);
    }
};

// Generate future event instances from recurring rules
const generateRecurringEventInstances = async (): Promise<void> => {
    try {
        const today = new Date();
        const threeMonthsFromNow = new Date(today);
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

        // Get parent events with recurrence rules
        const parentEvents = await pool.query(
            `SELECT * FROM events 
            WHERE recurring_rule IS NOT NULL 
            AND parent_event_id IS NULL`
        );

        for (const parentEvent of parentEvents.rows) {
            const rule: RecurrenceRule = parentEvent.recurring_rule;

            // Check if we need to generate more instances
            const lastInstance = await pool.query(
                `SELECT MAX(date) as last_date 
                FROM events 
                WHERE parent_event_id = $1`,
                [parentEvent.id]
            );

            const currentDate = lastInstance.rows[0]?.last_date
                ? new Date(lastInstance.rows[0].last_date)
                : new Date(parentEvent.date);

            const endDate = rule.endDate ? new Date(rule.endDate) : threeMonthsFromNow;

            // Generate instances up to 3 months from now or end date
            const instancesToCreate = [];

            while (currentDate < threeMonthsFromNow && currentDate < endDate) {
                // Calculate next occurrence based on frequency
                switch (rule.frequency) {
                    case 'daily':
                        currentDate.setDate(currentDate.getDate() + rule.interval);
                        break;
                    case 'weekly':
                        currentDate.setDate(currentDate.getDate() + (7 * rule.interval));

                        // If days of week specified, adjust to match
                        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
                            const currentDay = currentDate.getDay();
                            const nextDay = rule.daysOfWeek.find(day => day > currentDay) || rule.daysOfWeek[0];
                            const daysToAdd = nextDay > currentDay
                                ? nextDay - currentDay
                                : 7 - currentDay + nextDay;
                            currentDate.setDate(currentDate.getDate() + daysToAdd);
                        }
                        break;
                    case 'monthly':
                        currentDate.setMonth(currentDate.getMonth() + rule.interval);
                        break;
                }

                if (currentDate < threeMonthsFromNow && currentDate < endDate) {
                    instancesToCreate.push({
                        ...parentEvent,
                        date: currentDate.toISOString().split('T')[0],
                        parent_event_id: parentEvent.id
                    });
                }
            }

            // Insert new instances
            for (const instance of instancesToCreate) {
                // Check if instance already exists
                const exists = await pool.query(
                    `SELECT id FROM events 
                    WHERE parent_event_id = $1 AND date = $2`,
                    [parentEvent.id, instance.date]
                );

                if (exists.rows.length === 0) {
                    await pool.query(
                        `INSERT INTO events 
                        (title, date, time, type, description, parent_event_id, recurring_rule)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            instance.title,
                            instance.date,
                            instance.time,
                            instance.type,
                            instance.description,
                            parentEvent.id,
                            JSON.stringify(rule)
                        ]
                    );
                    console.log(`Created recurring event instance: ${instance.title} on ${instance.date}`);
                }
            }
        }
    } catch (error) {
        console.error('Error generating recurring event instances:', error);
    }
};

// Helper function to create recurring task
export const createRecurringTask = async (
    title: string,
    assignedTo: string,
    dueDate: string,
    priority: string,
    rule: RecurrenceRule
): Promise<string> => {
    try {
        // Create parent task
        const result = await pool.query(
            `INSERT INTO tasks 
            (title, assigned_to, due_date, priority, completed, recurring_rule)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [title, assignedTo, dueDate, priority, false, JSON.stringify(rule)]
        );

        const parentId = result.rows[0].id;

        // Generate initial instances (next 3 months)
        await generateRecurringTaskInstances();

        return parentId;
    } catch (error) {
        console.error('Error creating recurring task:', error);
        throw error;
    }
};

// Helper function to create recurring event
export const createRecurringEvent = async (
    title: string,
    date: string,
    time: string,
    type: string,
    description: string,
    rule: RecurrenceRule
): Promise<string> => {
    try {
        // Create parent event
        const result = await pool.query(
            `INSERT INTO events 
            (title, date, time, type, description, recurring_rule)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [title, date, time, type, description, JSON.stringify(rule)]
        );

        const parentId = result.rows[0].id;

        // Generate initial instances (next 3 months)
        await generateRecurringEventInstances();

        return parentId;
    } catch (error) {
        console.error('Error creating recurring event:', error);
        throw error;
    }
};

// Start recurring task generation cron job
export const startRecurringTaskJobs = (): void => {
    // Run daily at midnight to generate future instances
    cron.schedule('0 0 * * *', () => {
        console.log('Generating recurring task and event instances...');
        generateRecurringTaskInstances();
        generateRecurringEventInstances();
    });

    console.log('✅ Recurring task jobs scheduled');
};

