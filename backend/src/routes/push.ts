import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
    savePushSubscription,
    removePushSubscription,
    getVapidPublicKey,
    PushSubscription
} from '../services/pushNotifications';

const router = Router();

// Get VAPID public key
router.get('/vapid-public-key', (req: Request, res: Response) => {
    try {
        const publicKey = getVapidPublicKey();
        res.json({ publicKey });
    } catch (error) {
        console.error('Error getting VAPID public key:', error);
        res.status(500).json({ error: 'Failed to get VAPID public key' });
    }
});

// Subscribe to push notifications
router.post(
    '/subscribe',
    [
        body('user_id').trim().notEmpty().withMessage('User ID is required'),
        body('subscription').isObject().withMessage('Subscription object is required'),
        body('subscription.endpoint').trim().notEmpty().withMessage('Subscription endpoint is required'),
        body('subscription.keys').isObject().withMessage('Subscription keys are required'),
        body('subscription.keys.p256dh').trim().notEmpty().withMessage('p256dh key is required'),
        body('subscription.keys.auth').trim().notEmpty().withMessage('auth key is required'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { user_id, subscription } = req.body;
            const userAgent = req.get('User-Agent');

            await savePushSubscription(user_id, subscription as PushSubscription, userAgent);

            res.json({
                success: true,
                message: 'Push subscription saved successfully'
            });
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            res.status(500).json({ error: 'Failed to subscribe to push notifications' });
        }
    }
);

// Unsubscribe from push notifications
router.post(
    '/unsubscribe',
    [
        body('endpoint').trim().notEmpty().withMessage('Endpoint is required'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { endpoint } = req.body;

            await removePushSubscription(endpoint);

            res.json({
                success: true,
                message: 'Push subscription removed successfully'
            });
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            res.status(500).json({ error: 'Failed to unsubscribe from push notifications' });
        }
    }
);

export default router;

