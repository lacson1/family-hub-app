import { useState, useEffect } from 'react';

interface PushNotificationState {
    isSupported: boolean;
    isSubscribed: boolean;
    permission: NotificationPermission;
    subscription: PushSubscription | null;
}

interface UsePushNotificationsReturn extends PushNotificationState {
    requestPermission: () => Promise<boolean>;
    subscribe: (userId: string) => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
    checkSubscription: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const usePushNotifications = (): UsePushNotificationsReturn => {
    const [state, setState] = useState<PushNotificationState>({
        isSupported: 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window,
        isSubscribed: false,
        permission: 'Notification' in window ? Notification.permission : 'denied',
        subscription: null
    });

    useEffect(() => {
        if (state.isSupported) {
            checkSubscription();
        }
    }, [state.isSupported]);

    const checkSubscription = async (): Promise<void> => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            setState(prev => ({
                ...prev,
                isSubscribed: !!subscription,
                subscription: subscription || null,
                permission: Notification.permission
            }));
        } catch (error) {
            console.error('Error checking push subscription:', error);
        }
    };

    const requestPermission = async (): Promise<boolean> => {
        if (!state.isSupported) {
            console.error('Push notifications are not supported');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();

            setState(prev => ({
                ...prev,
                permission
            }));

            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    };

    const urlBase64ToUint8Array = (base64String: string): BufferSource => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray as BufferSource;
    };

    const subscribe = async (userId: string): Promise<boolean> => {
        if (!state.isSupported) {
            console.error('Push notifications are not supported');
            return false;
        }

        if (state.permission !== 'granted') {
            const granted = await requestPermission();
            if (!granted) {
                return false;
            }
        }

        try {
            // Get VAPID public key from server
            const vapidResponse = await fetch(`${API_URL}/push/vapid-public-key`);
            const { publicKey } = await vapidResponse.json();

            // Subscribe to push
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource
            });

            // Send subscription to server
            const response = await fetch(`${API_URL}/push/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    subscription: subscription.toJSON()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription');
            }

            setState(prev => ({
                ...prev,
                isSubscribed: true,
                subscription
            }));

            console.log('Successfully subscribed to push notifications');
            return true;
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            return false;
        }
    };

    const unsubscribe = async (): Promise<boolean> => {
        if (!state.subscription) {
            console.log('No active subscription to unsubscribe from');
            return false;
        }

        try {
            // Unsubscribe from push manager
            const success = await state.subscription.unsubscribe();

            if (success) {
                // Remove subscription from server
                await fetch(`${API_URL}/push/unsubscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint: state.subscription.endpoint
                    })
                });

                setState(prev => ({
                    ...prev,
                    isSubscribed: false,
                    subscription: null
                }));

                console.log('Successfully unsubscribed from push notifications');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            return false;
        }
    };

    return {
        ...state,
        requestPermission,
        subscribe,
        unsubscribe,
        checkSubscription
    };
};

export default usePushNotifications;

