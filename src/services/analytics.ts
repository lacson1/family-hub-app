import { apiClient } from './api';

export interface SpendingTrend {
    month: string;
    expenses: number;
    income: number;
    net: number;
}

export interface CategoryBreakdown {
    category: string;
    transactionCount: number;
    totalAmount: number;
}

export interface BudgetStatus {
    category: string;
    budgetAmount: number;
    spentAmount: number;
    remaining: number;
    percentage: number;
    transactionCount: number;
    period: string;
    status: 'good' | 'caution' | 'warning' | 'over';
}

export interface ProductivityByMember {
    member: string;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
}

export interface ProductivityStats {
    byMember: ProductivityByMember[];
    priorityDistribution: Array<{ priority: string; count: number }>;
    thisWeek: {
        total: number;
        completed: number;
        completionRate: number;
    };
}

export interface MealInsights {
    mealTypeDistribution: Array<{ mealType: string; count: number }>;
    topFavorites: Array<{
        name: string;
        timesMade: number;
        lastMade: string;
        daysSinceLastMade: number;
    }>;
    topIngredients: Array<{
        ingredient: string;
        usageCount: number;
    }>;
}

export interface FamilyActivity {
    byUser: Array<{
        userId: string;
        userName: string;
        activityCount: number;
        breakdown: Record<string, number>;
    }>;
    messagesSent: Array<{
        userId: string;
        count: number;
    }>;
}

export const analyticsAPI = {
    // Get spending trends
    async getSpendingTrends(months: number = 6, userId?: string): Promise<SpendingTrend[]> {
        const params = new URLSearchParams();
        params.append('months', months.toString());
        if (userId) params.append('user_id', userId);

        const response = await apiClient(`/analytics/spending-trends?${params}`);
        return response;
    },

    // Get category breakdown
    async getCategoryBreakdown(
        month?: Date,
        type: 'income' | 'expense' = 'expense',
        userId?: string
    ): Promise<CategoryBreakdown[]> {
        const params = new URLSearchParams();
        if (month) params.append('month', month.toISOString());
        params.append('type', type);
        if (userId) params.append('user_id', userId);

        const response = await apiClient(`/analytics/category-breakdown?${params}`);
        return response;
    },

    // Get budget status
    async getBudgetStatus(): Promise<BudgetStatus[]> {
        const response = await apiClient('/analytics/budget-status');
        return response;
    },

    // Get productivity stats
    async getProductivityStats(): Promise<ProductivityStats> {
        const response = await apiClient('/analytics/productivity');
        return response;
    },

    // Get meal insights
    async getMealInsights(): Promise<MealInsights> {
        const response = await apiClient('/analytics/meal-insights');
        return response;
    },

    // Get family activity stats
    async getFamilyActivity(): Promise<FamilyActivity> {
        const response = await apiClient('/analytics/family-activity');
        return response;
    }
};

export default analyticsAPI;

