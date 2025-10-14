import { TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react'
import './money-charts.css'

// Helper function to get percentage width class
const getPercentageClass = (percentage: number): string => {
    const rounded = Math.round(percentage / 5) * 5 // Round to nearest 5%
    return `w-pct-${Math.min(Math.max(rounded, 0), 100)}`
}

// Helper function to get color class
const getColorClass = (type: 'income' | 'expense', index: number): string => {
    return `color-${type}-${index % 4}`
}

interface Transaction {
    id: string
    type: 'income' | 'expense'
    category: string
    amount: number
    date: string
}

interface MoneyChartsProps {
    transactions: Transaction[]
}

export function MoneyCharts({ transactions }: MoneyChartsProps) {
    // Calculate category totals
    const getCategoryBreakdown = (type: 'income' | 'expense') => {
        const categoryTotals: Record<string, number> = {}

        transactions
            .filter(t => t.type === type)
            .forEach(t => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
            })

        return Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Top 5 categories
    }

    // Calculate monthly trends
    const getMonthlyData = () => {
        const monthlyData: Record<string, { income: number; expense: number }> = {}

        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expense: 0 }
            }
            monthlyData[month][t.type] += t.amount
        })

        return Object.entries(monthlyData).slice(-6) // Last 6 months
    }

    const incomeCategories = getCategoryBreakdown('income')
    const expenseCategories = getCategoryBreakdown('expense')
    const monthlyData = getMonthlyData()

    const totalIncome = incomeCategories.reduce((sum, [, amt]) => sum + amt, 0)
    const totalExpense = expenseCategories.reduce((sum, [, amt]) => sum + amt, 0)

    return (
        <div className="space-y-6">
            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income Categories */}
                <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Top Income Sources</h4>
                    </div>
                    {incomeCategories.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">No income data</p>
                    ) : (
                        <div className="space-y-3">
                            {incomeCategories.map(([category, amount], idx) => {
                                const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0
                                return (
                                    <div key={category}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{category}</span>
                                            <span className="font-semibold text-green-600">${amount.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`${getColorClass('income', idx)} h-2 rounded-full transition-all ${getPercentageClass(percentage)}`}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Expense Categories */}
                <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Top Expenses</h4>
                    </div>
                    {expenseCategories.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">No expense data</p>
                    ) : (
                        <div className="space-y-3">
                            {expenseCategories.map(([category, amount], idx) => {
                                const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0
                                return (
                                    <div key={category}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{category}</span>
                                            <span className="font-semibold text-red-600">${amount.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`${getColorClass('expense', idx)} h-2 rounded-full transition-all ${getPercentageClass(percentage)}`}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                    <PieChartIcon className="w-5 h-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Monthly Trend</h4>
                </div>
                {monthlyData.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No monthly data</p>
                ) : (
                    <div className="space-y-4">
                        {monthlyData.map(([month, data]) => {
                            const maxValue = Math.max(data.income, data.expense)
                            const incomeWidth = maxValue > 0 ? (data.income / maxValue) * 100 : 0
                            const expenseWidth = maxValue > 0 ? (data.expense / maxValue) * 100 : 0

                            return (
                                <div key={month} className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700">{month}</div>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-16 text-xs text-gray-500">Income</div>
                                            <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                                                <div
                                                    className={`bg-green-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all ${getPercentageClass(incomeWidth)}`}
                                                >
                                                    <span className="text-xs font-medium text-white">${data.income.toFixed(0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-16 text-xs text-gray-500">Expense</div>
                                            <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                                                <div
                                                    className={`bg-red-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all ${getPercentageClass(expenseWidth)}`}
                                                >
                                                    <span className="text-xs font-medium text-white">${data.expense.toFixed(0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

