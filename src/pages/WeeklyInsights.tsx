import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, CheckCircle, Brain, Target, Award } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

interface WeeklyStats {
  thoughtsAdded: number;
  tasksCompleted: number;
  categoryStats: { category: string; count: number; color: string }[];
  motivationalMessage: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  work: '#3b82f6',      // Blue
  shopping: '#10b981',  // Green
  idea: '#8b5cf6',      // Purple
  personal: '#14b8a6',  // Teal
  reminder: '#f59e0b',  // Orange
  health: '#ec4899',    // Pink
  travel: '#eab308',    // Yellow
  random: '#6b7280',    // Gray
};

const WeeklyInsightsContent: React.FC = () => {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchWeeklyStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range for this week (Monday to Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as 0
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      // Fetch all thoughts for this week
      const { data: allThoughts, error: allError } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', monday.toISOString())
        .lte('created_at', sunday.toISOString());

      if (allError) throw allError;

      // Fetch completed thoughts for this week
      const { data: completedThoughts, error: completedError } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'done')
        .gte('created_at', monday.toISOString())
        .lte('created_at', sunday.toISOString());

      if (completedError) throw completedError;

      // Calculate category statistics
      const categoryCount: Record<string, number> = {};
      allThoughts?.forEach(thought => {
        categoryCount[thought.category] = (categoryCount[thought.category] || 0) + 1;
      });

      const categoryStats = Object.entries(categoryCount)
        .map(([category, count]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          count,
          color: CATEGORY_COLORS[category] || '#6b7280'
        }))
        .sort((a, b) => b.count - a.count);

      // Generate motivational message
      const thoughtsAdded = allThoughts?.length || 0;
      const tasksCompleted = completedThoughts?.length || 0;
      
      let motivationalMessage = '';
      if (tasksCompleted >= 10) {
        motivationalMessage = "🚀 Incredible! You're absolutely crushing it this week!";
      } else if (tasksCompleted >= 5) {
        motivationalMessage = "🎉 Great job! You're making excellent progress this week!";
      } else if (tasksCompleted >= 1) {
        motivationalMessage = "👍 Nice work! Every completed task is a step forward!";
      } else if (thoughtsAdded >= 5) {
        motivationalMessage = "💭 You're capturing lots of thoughts! Now let's turn them into action!";
      } else {
        motivationalMessage = "🌱 Keep going! Small steps make big progress. You've got this!";
      }

      setStats({
        thoughtsAdded,
        tasksCompleted,
        categoryStats,
        motivationalMessage
      });

    } catch (err) {
      console.error('Error fetching weekly stats:', err);
      setError('Failed to load weekly insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWeeklyStats();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your weekly insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 dark:text-red-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Something went wrong</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchWeeklyStats}
            className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Prepare data for charts
  const barChartData = stats.categoryStats.slice(0, 5); // Top 5 categories
  const pieChartData = stats.categoryStats;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-8 w-8 text-primary-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Insights</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Your productivity journey this week</p>
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-primary-500 to-lavender-500 rounded-2xl p-6 text-white text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Award className="h-6 w-6" />
            <h2 className="text-xl font-semibold">This Week's Achievement</h2>
          </div>
          <p className="text-lg">{stats.motivationalMessage}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.thoughtsAdded}</h3>
            <p className="text-gray-600 dark:text-gray-400">Thoughts Captured</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.tasksCompleted}</h3>
            <p className="text-gray-600 dark:text-gray-400">Tasks Completed</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.tasksCompleted > 0 ? Math.round((stats.tasksCompleted / stats.thoughtsAdded) * 100) : 0}%
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Completion Rate</p>
          </div>
        </div>

        {/* Charts */}
        {stats.categoryStats.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="h-5 w-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Categories</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-6">
                <Brain className="h-5 w-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Distribution</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No data yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Start capturing thoughts to see your weekly insights!</p>
          </div>
        )}

        {/* Weekly Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Thoughts Captured</span>
                <span>{stats.thoughtsAdded}/20 goal</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.thoughtsAdded / 20) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Tasks Completed</span>
                <span>{stats.tasksCompleted}/10 goal</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.tasksCompleted / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WeeklyInsights: React.FC = () => {
  return (
    <ProtectedRoute>
      <WeeklyInsightsContent />
    </ProtectedRoute>
  );
};

export default WeeklyInsights;