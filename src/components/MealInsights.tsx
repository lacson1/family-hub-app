import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { UtensilsCrossed, Clock, TrendingUp, Star, Lightbulb } from 'lucide-react';
import analyticsAPI, { type MealInsights as MealInsightsData } from '../services/analytics';

export const MealInsights: React.FC = () => {
    const [insights, setInsights] = useState<MealInsightsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            setLoading(true);
            const data = await analyticsAPI.getMealInsights();
            setInsights(data);
        } catch (error) {
            console.error('Error loading meal insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!insights) {
        return <div className="text-center py-8 text-red-600">Failed to load meal insights</div>;
    }

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Meal Insights</h2>
            </div>

            {/* Meal Type Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <UtensilsCrossed className="w-5 h-5 mr-2 text-orange-600" />
                    Meal Type Distribution
                </h3>
                {insights.mealTypeDistribution.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={insights.mealTypeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ mealType, count }) => `${mealType}: ${count}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {insights.mealTypeDistribution.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3">
                            {insights.mealTypeDistribution.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div
                                            className="w-4 h-4 rounded mr-3"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                        <span className="font-medium capitalize">{item.mealType}</span>
                                    </div>
                                    <span className="text-gray-600 font-semibold">{item.count} meals</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-12">No meal data available</p>
                )}
            </div>

            {/* Top Favorite Meals */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Top Favorite Meals
                </h3>
                {insights.topFavorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insights.topFavorites.map((meal, index) => (
                            <div key={index} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                                    <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        #{index + 1}
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-600">
                                        Made <span className="font-semibold text-orange-600">{meal.timesMade}x</span>
                                    </p>
                                    <p className="text-gray-600">
                                        Last: <span className="font-medium">{new Date(meal.lastMade).toLocaleDateString()}</span>
                                    </p>
                                    {meal.daysSinceLastMade > 30 && (
                                        <p className="text-orange-600 font-medium flex items-center mt-2">
                                            <Lightbulb className="w-4 h-4 mr-1" />
                                            Time to make it again!
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No favorite meals tracked yet</p>
                )}
            </div>

            {/* Top Ingredients */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Most Common Ingredients
                </h3>
                {insights.topIngredients.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {insights.topIngredients.map((ingredient, index) => (
                            <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 capitalize">{ingredient.ingredient}</span>
                                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {ingredient.usageCount}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No ingredient data available</p>
                )}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        <span>
                            <strong>Tip:</strong> Keep these items in stock to reduce shopping trips!
                        </span>
                    </p>
                </div>
            </div>

            {/* Meal Rotation Suggestions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                    Meal Rotation Suggestions
                </h3>
                <div className="space-y-3">
                    {insights.topFavorites
                        .filter(meal => meal.daysSinceLastMade > 21)
                        .slice(0, 5)
                        .map((meal, index) => (
                            <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            Last made {meal.daysSinceLastMade} days ago
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                                        Plan Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    {insights.topFavorites.filter(meal => meal.daysSinceLastMade > 21).length === 0 && (
                        <p className="text-gray-500 text-center py-8">
                            Your meal rotation is looking good! All favorites have been made recently.
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Total Favorite Meals</p>
                    <p className="text-3xl font-bold text-indigo-600">{insights.topFavorites.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Unique Ingredients</p>
                    <p className="text-3xl font-bold text-green-600">{insights.topIngredients.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Meals Planned This Month</p>
                    <p className="text-3xl font-bold text-orange-600">
                        {insights.mealTypeDistribution.reduce((sum, item) => sum + item.count, 0)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MealInsights;

