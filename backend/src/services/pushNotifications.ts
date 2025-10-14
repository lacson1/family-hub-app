import webpush from 'web-push';
import pool from '../database/db';

// VAPID keys should be generated once and stored in environment variables
// Generate with: webpush.generateVAPIDKeys()
// For now, we'll use placeholder values - these should be in .env
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'GENERATE_NEW_VAPID_KEYS';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'GENERATE_NEW_VAPID_KEYS';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@familyhub.com';

// Initialize web-push
if (VAPID_PUBLIC_KEY !== 'GENERATE_NEW_VAPID_KEYS') {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
    console.log('Push notifications initialized');
} else {
    console.warn('⚠️  VAPID keys not configured. Generate them with:');
    console.warn('   const webpush = require("web-push");');
    console.warn('   console.log(webpush.generateVAPIDKeys());');
    console.warn('   Then add them to your .env file');
}

export interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
    actions?: Array<{
        action: string;
        title: string;
    }>;
    tag?: string;
    requireInteraction?: boolean;
}

// Save push subscription
export const savePushSubscription = async (
    userId: string,
    subscription: PushSubscription,
    userAgent?: string
): Promise<void> => {
    try {
        await pool.query(
            `INSERT INTO device_tokens (user_id, endpoint, keys, user_agent)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (endpoint) 
            DO UPDATE SET user_id = $1, keys = $3, user_agent = $4, updated_at = NOW()`,
            [userId, subscription.endpoint, JSON.stringify(subscription.keys), userAgent]
        );
        console.log(`Push subscription saved for user ${userId}`);
    } catch (error) {
        console.error('Error saving push subscription:', error);
        throw new Error('Failed to save push subscription');
    }
};

// Remove push subscription
export const removePushSubscription = async (endpoint: string): Promise<void> => {
    try {
        await pool.query(
            `DELETE FROM device_tokens WHERE endpoint = $1`,
            [endpoint]
        );
        console.log(`Push subscription removed for endpoint`);
    } catch (error) {
        console.error('Error removing push subscription:', error);
        throw new Error('Failed to remove push subscription');
    }
};

// Get all subscriptions for a user
export const getUserSubscriptions = async (userId: string): Promise<PushSubscription[]> => {
    try {
        const result = await pool.query(
            `SELECT endpoint, keys FROM device_tokens WHERE user_id = $1`,
            [userId]
        );

        return result.rows.map(row => ({
            endpoint: row.endpoint,
            keys: row.keys
        }));
    } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        return [];
    }
};

// Send push notification to a specific subscription
export const sendPushToSubscription = async (
    subscription: PushSubscription,
    payload: PushNotificationPayload
): Promise<boolean> => {
    if (VAPID_PUBLIC_KEY === 'GENERATE_NEW_VAPID_KEYS') {
        console.warn('Push notifications not configured - skipping send');
        return false;
    }

    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        return true;
    } catch (error: any) {
        console.error('Error sending push notification:', error);

        // If subscription is no longer valid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
            await removePushSubscription(subscription.endpoint);
        }

        return false;
    }
};

// Send push notification to a user (all their devices)
export const sendPushToUser = async (
    userId: string,
    payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> => {
    const subscriptions = await getUserSubscriptions(userId);

    if (subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
        const success = await sendPushToSubscription(subscription, payload);
        if (success) {
            sent++;
        } else {
            failed++;
        }
    }

    console.log(`Push sent to user ${userId}: ${sent} successful, ${failed} failed`);
    return { sent, failed };
};

// Send push notification to multiple users
export const sendPushToUsers = async (
    userIds: string[],
    payload: PushNotificationPayload
): Promise<{ totalSent: number; totalFailed: number }> => {
    let totalSent = 0;
    let totalFailed = 0;

    for (const userId of userIds) {
        const { sent, failed } = await sendPushToUser(userId, payload);
        totalSent += sent;
        totalFailed += failed;
    }

    return { totalSent, totalFailed };
};

// Predefined notification types
export const sendTaskDueNotification = async (userId: string, taskTitle: string, dueIn: string): Promise<void> => {
    await sendPushToUser(userId, {
        title: '📋 Task Due Soon',
        body: `"${taskTitle}" is due ${dueIn}`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'task-reminder',
        data: { type: 'task', url: '/?tab=tasks' },
        actions: [
            { action: 'view', title: 'View Task' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    });
};

export const sendEventStartingNotification = async (userId: string, eventTitle: string, startsIn: string): Promise<void> => {
    await sendPushToUser(userId, {
        title: '📅 Event Starting Soon',
        body: `"${eventTitle}" starts ${startsIn}`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'event-reminder',
        requireInteraction: true,
        data: { type: 'event', url: '/?tab=calendar' },
        actions: [
            { action: 'view', title: 'View Event' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    });
};

export const sendNewMessageNotification = async (recipientId: string, senderName: string, preview: string): Promise<void> => {
    await sendPushToUser(recipientId, {
        title: `💬 New message from ${senderName}`,
        body: preview,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'new-message',
        data: { type: 'message', url: '/?tab=messages' },
        actions: [
            { action: 'view', title: 'View Message' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    });
};

export const sendBudgetAlertNotification = async (userId: string, category: string, percentage: number): Promise<void> => {
    const emoji = percentage >= 100 ? '🚨' : percentage >= 90 ? '⚠️' : '💰';
    const urgency = percentage >= 100 ? 'exceeded' : 'approaching';

    await sendPushToUser(userId, {
        title: `${emoji} Budget Alert`,
        body: `You've ${urgency} your ${category} budget (${percentage}%)`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'budget-alert',
        requireInteraction: percentage >= 100,
        data: { type: 'budget', url: '/?tab=money' },
        actions: [
            { action: 'view', title: 'View Budget' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    });
};

export const sendShoppingListUpdateNotification = async (userIds: string[], itemsAdded: number, addedBy: string): Promise<void> => {
    await sendPushToUsers(userIds, {
        title: '🛒 Shopping List Updated',
        body: `${addedBy} added ${itemsAdded} item${itemsAdded > 1 ? 's' : ''} to the shopping list`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'shopping-update',
        data: { type: 'shopping', url: '/?tab=shopping' },
        actions: [
            { action: 'view', title: 'View List' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    });
};

export const sendMealPrepReminderNotification = async (userId: string, mealName: string, prepTime: string): Promise<void> => {
    await sendPushToUser(userId, {
        title: '🍽️ Meal Prep Reminder',
        body: `Time to start preparing "${mealName}" (${prepTime})`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'meal-prep',
        requireInteraction: true,
        data: { type: 'meal', url: '/?tab=meals' },
        actions: [
            { action: 'view', title: 'View Meal' },
            { action: 'dismiss', title: 'Later' }
        ]
    });
};

// Get VAPID public key for frontend
export const getVapidPublicKey = (): string => {
    return VAPID_PUBLIC_KEY;
};

