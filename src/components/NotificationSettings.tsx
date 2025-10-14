import { useState, useEffect } from 'react';
import { Bell, Clock, Mail, Settings, Check, X } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface NotificationPreferences {
    user_id: string;
    enable_task: boolean;
    enable_event: boolean;
    enable_message: boolean;
    enable_shopping: boolean;
    enable_meal: boolean;
    enable_family: boolean;
    enable_general: boolean;
    enable_push_notifications: boolean;
    enable_browser_notifications: boolean;
    quiet_hours_enabled: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
    enable_email_notifications: boolean;
    email_digest_frequency: 'none' | 'daily' | 'weekly';
}

interface NotificationSettingsProps {
    userId: string;
    onClose: () => void;
}

export const NotificationSettings = ({ userId, onClose }: NotificationSettingsProps) => {
    const pushNotifications = usePushNotifications();
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadPreferences();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/notification-preferences/${userId}`);
            if (!response.ok) throw new Error('Failed to load preferences');
            const data = await response.json();
            setPreferences(data);
        } catch (error) {
            console.error('Error loading preferences:', error);
            showMessage('error', 'Failed to load notification preferences');
        } finally {
            setLoading(false);
        }
    };

    const savePreferences = async () => {
        if (!preferences) return;

        try {
            setSaving(true);
            const response = await fetch(`${API_URL}/notification-preferences/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences),
            });

            if (!response.ok) throw new Error('Failed to save preferences');

            showMessage('success', 'Notification preferences saved successfully!');
        } catch (error) {
            console.error('Error saving preferences:', error);
            showMessage('error', 'Failed to save notification preferences');
        } finally {
            setSaving(false);
        }
    };

    const resetPreferences = async () => {
        if (!confirm('Reset all notification preferences to defaults?')) return;

        try {
            setSaving(true);
            const response = await fetch(`${API_URL}/notification-preferences/${userId}/reset`, {
                method: 'POST',
            });

            if (!response.ok) throw new Error('Failed to reset preferences');

            await loadPreferences();
            showMessage('success', 'Preferences reset to defaults');
        } catch (error) {
            console.error('Error resetting preferences:', error);
            showMessage('error', 'Failed to reset preferences');
        } finally {
            setSaving(false);
        }
    };

    const togglePushNotifications = async () => {
        if (!preferences) return;

        if (!preferences.enable_push_notifications) {
            // Subscribe to push notifications
            const success = await pushNotifications.subscribe(userId);
            if (success) {
                setPreferences({ ...preferences, enable_push_notifications: true });
                showMessage('success', 'Push notifications enabled!');
            } else {
                showMessage('error', 'Failed to enable push notifications');
            }
        } else {
            // Unsubscribe from push notifications
            const success = await pushNotifications.unsubscribe();
            if (success) {
                setPreferences({ ...preferences, enable_push_notifications: false });
                showMessage('success', 'Push notifications disabled');
            } else {
                showMessage('error', 'Failed to disable push notifications');
            }
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const updatePreference = <K extends keyof NotificationPreferences>(
        key: K,
        value: NotificationPreferences[K]
    ) => {
        if (!preferences) return;
        setPreferences({ ...preferences, [key]: value });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!preferences) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Settings className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">Notification Settings</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all"
                            aria-label="Close settings"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Message Banner */}
                {message && (
                    <div
                        className={`px-6 py-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            {message.type === 'success' ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Notification Categories */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Notification Categories</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { key: 'enable_task', label: 'Tasks', description: 'Task reminders and updates' },
                                { key: 'enable_event', label: 'Events', description: 'Calendar events and reminders' },
                                { key: 'enable_message', label: 'Messages', description: 'New messages from family' },
                                { key: 'enable_shopping', label: 'Shopping', description: 'Shopping list updates' },
                                { key: 'enable_meal', label: 'Meals', description: 'Meal planning and prep reminders' },
                                { key: 'enable_family', label: 'Family', description: 'Family member updates' },
                                { key: 'enable_general', label: 'General', description: 'General app notifications' },
                            ].map(({ key, label, description }) => (
                                <label
                                    key={key}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{label}</div>
                                        <div className="text-xs text-gray-500">{description}</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences[key as keyof NotificationPreferences] as boolean}
                                        onChange={(e) =>
                                            updatePreference(key as keyof NotificationPreferences, e.target.checked)
                                        }
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Push Notifications */}
                    {pushNotifications.isSupported && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-blue-900 mb-1">Push Notifications</h4>
                                    <p className="text-sm text-blue-700 mb-2">
                                        Receive notifications even when the app is closed
                                    </p>
                                    {pushNotifications.permission === 'denied' && (
                                        <p className="text-xs text-red-600 mt-1">
                                            ⚠️ Push notifications are blocked. Please enable them in your browser settings.
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={togglePushNotifications}
                                    disabled={pushNotifications.permission === 'denied'}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${preferences.enable_push_notifications
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {preferences.enable_push_notifications ? 'Enabled' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quiet Hours */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Clock className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Quiet Hours</h3>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                                <span className="font-medium text-gray-900">Enable Quiet Hours</span>
                                <input
                                    type="checkbox"
                                    checked={preferences.quiet_hours_enabled}
                                    onChange={(e) => updatePreference('quiet_hours_enabled', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                            {preferences.quiet_hours_enabled && (
                                <div className="grid grid-cols-2 gap-4 pl-3">
                                    <div>
                                        <label htmlFor="quiet-start" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                        <input
                                            id="quiet-start"
                                            type="time"
                                            value={preferences.quiet_hours_start}
                                            onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            aria-label="Quiet hours start time"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="quiet-end" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                        <input
                                            id="quiet-end"
                                            type="time"
                                            value={preferences.quiet_hours_end}
                                            onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            aria-label="Quiet hours end time"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email Notifications (Future) */}
                    <div className="mb-6 opacity-50 pointer-events-none">
                        <div className="flex items-center space-x-2 mb-4">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-900">Enable Email Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={preferences.enable_email_notifications}
                                    disabled
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={resetPreferences}
                            disabled={saving}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
                        >
                            Reset to Defaults
                        </button>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onClose}
                                disabled={saving}
                                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={savePreferences}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;

