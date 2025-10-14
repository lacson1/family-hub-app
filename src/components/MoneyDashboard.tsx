import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Download, AlertCircle } from 'lucide-react';
import analyticsAPI, { type SpendingTrend, type CategoryBreakdown, type BudgetStatus } from '../services/analytics';
import './dashboard.css';

export const MoneyDashboard: React.FC = () => {
    const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
    const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonths, setSelectedMonths] = useState(6);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [trends, breakdown, budgets] = await Promise.all([
                analyticsAPI.getSpendingTrends(selectedMonths),
                analyticsAPI.getCategoryBreakdown(),
                analyticsAPI.getBudgetStatus()
            ]);

            setSpendingTrends(trends);
            setCategoryBreakdown(breakdown);
            setBudgetStatus(budgets);
        } catch (error) {
            console.error('Error loading money dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedMonths]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const exportToCSV = () => {
        const csvContent = [
            ['Category', 'Budget', 'Spent', 'Remaining', 'Percentage'],
            ...budgetStatus.map(b => [
                b.category,
                b.budgetAmount.toFixed(2),
                b.spentAmount.toFixed(2),
                b.remaining.toFixed(2),
                `${b.percentage}%`
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    const getBudgetStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'text-green-600 bg-green-50';
            case 'caution': return 'text-yellow-600 bg-yellow-50';
            case 'warning': return 'text-orange-600 bg-orange-50';
            case 'over': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const totalIncome = spendingTrends.reduce((sum, t) => sum + t.income, 0);
    const totalExpenses = spendingTrends.reduce((sum, t) => sum + t.expenses, 0);
    const netAmount = totalIncome - totalExpenses;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Money Dashboard</h2>
                <div className="flex gap-2">
                    <select
                        value={selectedMonths}
                        onChange={(e) => setSelectedMonths(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        aria-label="Select time period"
                        title="Select time period"
                    >
                        <option value={3}>Last 3 months</option>
                        <option value={6}>Last 6 months</option>
                        <option value={12}>Last 12 months</option>
                    </select>
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Income</p>
                            <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                        </div>
                        <TrendingDown className="w-10 h-10 text-red-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Net Amount</p>
                            <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${Math.abs(netAmount).toFixed(2)}
                            </p>
                        </div>
                        <DollarSign className={`w-10 h-10 opacity-20 ${netAmount >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                </div>
            </div>

            {/* Spending Trends Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={spendingTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            formatter={(value: number) => `$${value.toFixed(2)}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
                        <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                        <Line type="monotone" dataKey="net" stroke="#4F46E5" strokeWidth={2} name="Net" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
                    {categoryBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryBreakdown as Array<CategoryBreakdown & Record<string, unknown>>}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props) =>
                                        `${(props as unknown as CategoryBreakdown).category}: $${(props as unknown as CategoryBreakdown).totalAmount.toFixed(0)}`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="totalAmount"
                                >
                                    {categoryBreakdown.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No spending data available</p>
                    )}
                </div>

                {/* Budget Status */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Budget Status</h3>
                    {budgetStatus.length > 0 ? (
                        <div className="space-y-4">
                            {budgetStatus.map((budget, index) => (
                                <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-900">{budget.category}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBudgetStatusColor(budget.status)}`}>
                                            {budget.percentage}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>${budget.spentAmount.toFixed(2)} spent</span>
                                        <span>${budget.remaining.toFixed(2)} left</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        {(() => {
                                            const clamped = Math.max(0, Math.min(100, budget.percentage));
                                            const bucket = Math.round(clamped / 5) * 5;
                                            const color = budget.status === 'over' ? 'bg-red-500'
                                                : budget.status === 'warning' ? 'bg-orange-500'
                                                : budget.status === 'caution' ? 'bg-yellow-500'
                                                : 'bg-green-500';
                                            return (
                                                <div className={`h-2 rounded-full transition-all ${color} w-pct-${bucket}`}></div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">No budgets set</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoneyDashboard;

