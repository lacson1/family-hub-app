import { useState, useEffect, useCallback } from 'react';
import {
    Calendar, CheckSquare, ShoppingCart, MessageSquare,
    UtensilsCrossed, TrendingUp, Plus,
    Clock, AlertCircle, Activity
} from 'lucide-react';
import { apiClient } from '../services/api';

interface DashboardTask {
    id: string;
    title: string;
    due_date?: string;
    priority?: string;
    completed: boolean;
    assigned_to?: string;
}

interface DashboardMeal {
    id: string;
    name: string;
    meal_type: string;
    date: string;
    prep_time?: string;
}

interface DashboardEvent {
    id: string;
    title: string;
    date: string;
    time?: string;
    type?: string;
}

interface DashboardSummary {
    today: {
        date: string;
        tasks: DashboardTask[];
        meals: DashboardMeal[];
        events: DashboardEvent[];
    };
    stats: {
        unreadMessages: number;
        pendingShopping: number;
        taskCompletionRate: number;
        tasksThisWeek: {
            total: number;
            completed: number;
        };
        familyMembersCount: number;
    };
    budgets: Array<{
        category: string;
        budgetAmount: number;
        spentAmount: number;
        percentage: number;
    }>;
    recentActivity: Array<{
        id: string;
        user_name: string;
        action_type: string;
        entity_type: string;
        description: string;
        created_at: string;
    }>;
}

interface DashboardProps {
    userId?: string;
    onNavigate?: (tab: string) => void;
    onOpenAddModal?: (type: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, onNavigate, onOpenAddModal }) => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const params = userId ? `?user_id=${userId}` : '';
            const data = await apiClient(`/dashboard/summary${params}`);
            setSummary(data);
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getBudgetStatusColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 90) return 'bg-orange-500';
        if (percentage >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="text-center py-8 text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                <p>{error || 'Failed to load dashboard'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">
                        {new Date(summary.today.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onNavigate?.('tasks')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Task Completion</p>
                            <p className="text-2xl font-bold text-indigo-600">{summary.stats.taskCompletionRate}%</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {summary.stats.tasksThisWeek.completed} of {summary.stats.tasksThisWeek.total} this week
                            </p>
                        </div>
                        <CheckSquare className="w-10 h-10 text-indigo-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onNavigate?.('messages')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Unread Messages</p>
                            <p className="text-2xl font-bold text-purple-600">{summary.stats.unreadMessages}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {summary.stats.unreadMessages > 0 ? 'Click to view' : 'All caught up!'}
                            </p>
                        </div>
                        <MessageSquare className="w-10 h-10 text-purple-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onNavigate?.('shopping')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Shopping List</p>
                            <p className="text-2xl font-bold text-green-600">{summary.stats.pendingShopping}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {summary.stats.pendingShopping > 0 ? 'items to buy' : 'List is empty'}
                            </p>
                        </div>
                        <ShoppingCart className="w-10 h-10 text-green-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Family Members</p>
                            <p className="text-2xl font-bold text-orange-600">{summary.stats.familyMembersCount}</p>
                            <p className="text-xs text-gray-400 mt-1">Active members</p>
                        </div>
                        <Activity className="w-10 h-10 text-orange-500 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Today's Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks Due Today */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <CheckSquare className="w-5 h-5 mr-2 text-indigo-600" />
                            Tasks Due Today
                        </h2>
                        <button
                            onClick={() => onOpenAddModal?.('task')}
                            className="p-1 hover:bg-gray-100 rounded"
                            aria-label="Add new task"
                            title="Add new task"
                        >
                            <Plus className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    {summary.today.tasks.length > 0 ? (
                        <div className="space-y-2">
                            {summary.today.tasks.map((task) => (
                                <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        className="mr-3"
                                        readOnly
                                        aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                                    />
                                    <div className="flex-1">
                                        <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                            {task.title}
                                        </p>
                                        <p className="text-xs text-gray-500">{task.assigned_to}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No tasks due today</p>
                    )}
                </div>

                {/* Today's Meals */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <UtensilsCrossed className="w-5 h-5 mr-2 text-orange-600" />
                            Today's Meals
                        </h2>
                        <button
                            onClick={() => onOpenAddModal?.('meal')}
                            className="p-1 hover:bg-gray-100 rounded"
                            aria-label="Add new meal"
                            title="Add new meal"
                        >
                            <Plus className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    {summary.today.meals.length > 0 ? (
                        <div className="space-y-2">
                            {summary.today.meals.map((meal) => (
                                <div key={meal.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">{meal.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{meal.meal_type}</p>
                                    </div>
                                    {meal.prep_time && (
                                        <span className="text-xs text-gray-500 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {meal.prep_time}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No meals planned today</p>
                    )}
                </div>
            </div>

            {/* Upcoming Events */}
            {summary.today.events.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Upcoming Events (24 hours)
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {summary.today.events.map((event) => (
                            <div key={event.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="font-medium text-blue-900">{event.title}</p>
                                <p className="text-sm text-blue-600 mt-1">
                                    {new Date(`${event.date}T${event.time}`).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Budget Status */}
            {summary.budgets.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        Budget Status (This Month)
                    </h2>
                    <div className="space-y-3">
                        {summary.budgets.slice(0, 5).map((budget, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{budget.category}</span>
                                    <span className="text-gray-600">
                                        ${budget.spentAmount.toFixed(2)} / ${budget.budgetAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${getBudgetStatusColor(budget.percentage)}`}
                                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{budget.percentage}% used</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity Feed */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-600" />
                    Recent Activity
                </h2>
                {summary.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                        {summary.recentActivity.slice(0, 10).map((activity) => (
                            <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-xs font-medium text-indigo-600">
                                        {activity.user_name?.charAt(0).toUpperCase() || '?'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">{activity.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">{getRelativeTime(activity.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

