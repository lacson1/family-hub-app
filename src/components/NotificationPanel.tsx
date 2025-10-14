import { useEffect, useRef, useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle, Settings } from 'lucide-react';
import type { Notification } from '../services/api';

interface NotificationPanelProps {
    notifications: Notification[];
    unreadCount: number;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDelete: (id: string) => void;
    onClearRead: () => void;
    onNotificationClick?: (notification: Notification) => void;
    onOpenSettings?: () => void;
}

export const NotificationPanel = ({
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onClearRead,
    onNotificationClick,
    onOpenSettings,
}: NotificationPanelProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getCategoryColor = (category: Notification['category']) => {
        switch (category) {
            case 'task':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'event':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'message':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'shopping':
                return 'bg-pink-50 text-pink-700 border-pink-200';
            case 'meal':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'family':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const formatTime = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return then.toLocaleDateString();
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        if (onNotificationClick) {
            onNotificationClick(notification);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all btn-press"
                title="Notifications"
                aria-label="View notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-fade-in">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                            <div className="flex items-center space-x-1">
                                {onOpenSettings && (
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            onOpenSettings();
                                        }}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                        title="Notification Settings"
                                        aria-label="Open notification settings"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                    aria-label="Close notifications"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {notifications.length > 0 && (
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={onMarkAllAsRead}
                                        className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        <span>Mark all read</span>
                                    </button>
                                )}
                                <button
                                    onClick={onClearRead}
                                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Clear read</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[500px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                                <p className="text-gray-400 text-xs mt-1">We'll notify you when something happens</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 transition-all cursor-pointer group ${notification.read
                                            ? 'bg-white hover:bg-gray-50'
                                            : 'bg-blue-50 hover:bg-blue-100'
                                            }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h4 className={`text-sm font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'
                                                        }`}>
                                                        {notification.title}
                                                    </h4>
                                                    <div className="flex items-center space-x-1 ml-2">
                                                        {!notification.read && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onMarkAsRead(notification.id);
                                                                }}
                                                                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-all opacity-0 group-hover:opacity-100"
                                                                title="Mark as read"
                                                                aria-label="Mark as read"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(notification.id);
                                                            }}
                                                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete notification"
                                                            aria-label="Delete notification"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className={`text-xs ${notification.read ? 'text-gray-500' : 'text-gray-700'
                                                    }`}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(notification.category)
                                                        }`}>
                                                        {notification.category}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {formatTime(notification.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

