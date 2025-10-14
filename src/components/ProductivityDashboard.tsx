import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Target, Zap, TrendingUp, Award } from 'lucide-react';
import analyticsAPI, { type ProductivityStats } from '../services/analytics';

export const ProductivityDashboard: React.FC = () => {
    const [stats, setStats] = useState<ProductivityStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await analyticsAPI.getProductivityStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading productivity stats:', error);
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

    if (!stats) {
        return <div className="text-center py-8 text-red-600">Failed to load productivity stats</div>;
    }

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    // Calculate streak (mock - would need backend support)
    const currentStreak = 5;
    const longestStreak = 12;

    // Achievement badges (mock)
    const badges = [
        { id: 1, name: 'Task Master', icon: Trophy, earned: true, color: 'text-yellow-500' },
        { id: 2, name: 'Speed Demon', icon: Zap, earned: true, color: 'text-blue-500' },
        { id: 3, name: 'Team Player', icon: Award, earned: false, color: 'text-gray-400' },
        { id: 4, name: 'Consistency King', icon: Target, earned: false, color: 'text-gray-400' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Productivity Dashboard</h2>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">This Week</p>
                            <p className="text-2xl font-bold text-indigo-600">{stats.thisWeek.completionRate}%</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.thisWeek.completed}/{stats.thisWeek.total} tasks
                            </p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-indigo-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Current Streak</p>
                            <p className="text-2xl font-bold text-green-600">{currentStreak} days</p>
                            <p className="text-xs text-gray-500 mt-1">Keep it up!</p>
                        </div>
                        <Zap className="w-10 h-10 text-green-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Longest Streak</p>
                            <p className="text-2xl font-bold text-orange-600">{longestStreak} days</p>
                            <p className="text-xs text-gray-500 mt-1">Personal best</p>
                        </div>
                        <Trophy className="w-10 h-10 text-orange-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Badges Earned</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {badges.filter(b => b.earned).length}/{badges.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Achievements</p>
                        </div>
                        <Award className="w-10 h-10 text-purple-500 opacity-20" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completion Rate by Member */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Completion Rate by Member</h3>
                    {stats.byMember.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.byMember}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="member" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `${value}%`} />
                                <Legend />
                                <Bar dataKey="completionRate" fill="#4F46E5" name="Completion Rate %" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No data available</p>
                    )}
                </div>

                {/* Priority Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
                    {stats.priorityDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.priorityDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ priority, count }) => `${priority}: ${count}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {stats.priorityDistribution.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No data available</p>
                    )}
                </div>
            </div>

            {/* Team Performance Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Tasks</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdue</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.byMember.map((member, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {member.member}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                                        {member.totalTasks}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-green-600 font-medium">
                                        {member.completedTasks}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-red-600 font-medium">
                                        {member.overdueTasks}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className={`font-semibold ${member.completionRate >= 80 ? 'text-green-600' :
                                                member.completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {member.completionRate}%
                                            </span>
                                            <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${member.completionRate >= 80 ? 'bg-green-500' :
                                                        member.completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${member.completionRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Achievement Badges</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badges.map((badge) => {
                        const Icon = badge.icon;
                        return (
                            <div
                                key={badge.id}
                                className={`p-4 rounded-lg border-2 text-center transition-all ${badge.earned
                                    ? 'border-indigo-200 bg-indigo-50'
                                    : 'border-gray-200 bg-gray-50 opacity-50'
                                    }`}
                            >
                                <Icon className={`w-12 h-12 mx-auto mb-2 ${badge.color}`} />
                                <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                                {badge.earned ? (
                                    <span className="text-xs text-green-600 font-medium">Earned!</span>
                                ) : (
                                    <span className="text-xs text-gray-500">Locked</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProductivityDashboard;


