import { useState } from 'react'
import { Save } from 'lucide-react'

export interface AppSettings {
    // Notification Settings
    emailNotifications: boolean
    pushNotifications: boolean
    taskReminders: boolean
    eventReminders: boolean

    // Display Settings
    theme: 'light' | 'dark' | 'auto'
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
    timeFormat: '12h' | '24h'
    compactView: boolean

    // Privacy Settings
    showLastSeen: boolean
    readReceipts: boolean

    // App Preferences
    defaultView: string
    autoMarkTasksComplete: boolean
    showCompletedTasks: boolean
}

interface SettingsFormProps {
    initialSettings: AppSettings
    onSave: (settings: AppSettings) => void
    onCancel?: () => void
}

export const SettingsForm = ({ initialSettings, onSave, onCancel }: SettingsFormProps) => {
    const [settings, setSettings] = useState<AppSettings>(initialSettings)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(settings)
    }

    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Notification Settings */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Notification Settings
                </h3>
                <div className="space-y-4 pl-5">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Email Notifications</span>
                            <span className="text-xs text-gray-500">Receive updates via email</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Push Notifications</span>
                            <span className="text-xs text-gray-500">Get instant browser notifications</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.pushNotifications}
                            onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Task Reminders</span>
                            <span className="text-xs text-gray-500">Get notified about upcoming tasks</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.taskReminders}
                            onChange={(e) => updateSetting('taskReminders', e.target.checked)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Event Reminders</span>
                            <span className="text-xs text-gray-500">Get notified about upcoming events</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.eventReminders}
                            onChange={(e) => updateSetting('eventReminders', e.target.checked)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                </div>
            </div>

            {/* Display Settings */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Display Settings
                </h3>
                <div className="space-y-4 pl-5">
                    <div className="p-3 bg-gray-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-900 block mb-2" htmlFor="theme-select">Theme</label>
                        <select
                            id="theme-select"
                            value={settings.theme}
                            onChange={(e) => updateSetting('theme', e.target.value as AppSettings['theme'])}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto (System)</option>
                        </select>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-900 block mb-2" htmlFor="date-format-select">Date Format</label>
                        <select
                            id="date-format-select"
                            value={settings.dateFormat}
                            onChange={(e) => updateSetting('dateFormat', e.target.value as AppSettings['dateFormat'])}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY (UK)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                        </select>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-900 block mb-2" htmlFor="time-format-select">Time Format</label>
                        <select
                            id="time-format-select"
                            value={settings.timeFormat}
                            onChange={(e) => updateSetting('timeFormat', e.target.value as AppSettings['timeFormat'])}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="12h">12 Hour (AM/PM)</option>
                            <option value="24h">24 Hour</option>
                        </select>
                    </div>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Compact View</span>
                            <span className="text-xs text-gray-500">Show more items in less space</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.compactView}
                            onChange={(e) => updateSetting('compactView', e.target.checked)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                </div>
            </div>

            {/* Privacy Settings */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Privacy Settings
                </h3>
                <div className="space-y-4 pl-5">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Show Last Seen</span>
                            <span className="text-xs text-gray-500">Let family see when you were last active</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.showLastSeen}
                            onChange={(e) => updateSetting('showLastSeen', e.target.checked)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Read Receipts</span>
                            <span className="text-xs text-gray-500">Let others know when you've read messages</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.readReceipts}
                            onChange={(e) => updateSetting('readReceipts', e.target.checked)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                </div>
            </div>

            {/* App Preferences */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    App Preferences
                </h3>
                <div className="space-y-4 pl-5">
                    <div className="p-3 bg-gray-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-900 block mb-2" htmlFor="default-view-select">Default View</label>
                        <select
                            id="default-view-select"
                            value={settings.defaultView}
                            onChange={(e) => updateSetting('defaultView', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="dashboard">Dashboard</option>
                            <option value="calendar">Calendar</option>
                            <option value="tasks">Tasks</option>
                            <option value="shopping">Shopping</option>
                            <option value="messages">Messages</option>
                        </select>
                    </div>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Auto-mark Tasks as Complete</span>
                            <span className="text-xs text-gray-500">Automatically mark tasks as done on due date</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.autoMarkTasksComplete}
                            onChange={(e) => updateSetting('autoMarkTasksComplete', e.target.checked)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Show Completed Tasks</span>
                            <span className="text-xs text-gray-500">Display completed tasks in task lists</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.showCompletedTasks}
                            onChange={(e) => updateSetting('showCompletedTasks', e.target.checked)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium btn-press"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
                >
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                </button>
            </div>
        </form>
    )
}

