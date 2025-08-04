import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  CalendarDays, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Clock,
  Activity,
  BarChart3,
  Heart
} from 'lucide-react';

const Dashboard = () => {
  const { getDashboardStats, recentActivity, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const navigate = useNavigate();
  const stats = getDashboardStats();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Assessment':
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'Resource':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'Support':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100">Track your mental wellness journey and discover resources to support your growth.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Assessments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedAssessments}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Assessment</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.lastScore} (Confidence: {stats.lastConfidence})</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wellness Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.wellnessStreak} {stats.wellnessStreak === 1 ? 'day' : 'days'}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard/assessment')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Take Assessment
            </button>
            <button 
              onClick={() => navigate('/resources')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              View Resources
            </button>
            <button 
              onClick={() => navigate('/support')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Find Support
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Clock className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.desc}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(activity.date)} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wellness Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Wellness Tip</h3>
        <p className="text-gray-700 dark:text-gray-300">
          "Practice mindful breathing for 5 minutes daily. This simple technique can help reduce stress and improve your overall mental clarity."
        </p>
      </div>
    </div>
  );
};

export default Dashboard; 