import React, { useState } from 'react';
import { Clock, CheckSquare } from 'lucide-react';

interface Meal {
    id: string;
    name: string;
    date: string;
    meal_type?: string;
    mealType?: string;
    prep_time?: string;
    prepTime?: string;
}

interface TaskFromMealButtonProps {
    meal: Meal;
    onCreateTask: (meal: Meal) => Promise<void> | void;
    compact?: boolean;
}

export const TaskFromMealButton: React.FC<TaskFromMealButtonProps> = ({
    meal,
    onCreateTask,
    compact = false
}) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        try {
            await onCreateTask(meal);
        } catch (error) {
            console.error('Error creating task from meal:', error);
        } finally {
            setLoading(false);
        }
    };

    if (compact) {
        return (
            <button
                onClick={handleClick}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all btn-press disabled:opacity-50"
                title="Create prep task"
                aria-label="Create preparation task for this meal"
            >
                {loading ? (
                    <Clock className="w-4 h-4 animate-spin" />
                ) : (
                    <CheckSquare className="w-4 h-4" />
                )}
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm ${loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-soft hover:shadow-medium btn-press'
                }`}
            aria-label="Create preparation task for this meal"
        >
            {loading ? (
                <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                </>
            ) : (
                <>
                    <CheckSquare className="w-4 h-4" />
                    <span>Create Prep Task</span>
                </>
            )}
        </button>
    );
};

// Helper component for task generation info
export const TaskGenerationInfo: React.FC = () => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="flex items-start gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-medium text-blue-900">Quick Tip: Auto-create Tasks</p>
                    <p className="text-blue-700 mt-1">
                        Click the checkbox icon on any meal to automatically create a preparation task.
                        The task will be scheduled 1 hour before the meal time.
                    </p>
                </div>
            </div>
        </div>
    );
};

