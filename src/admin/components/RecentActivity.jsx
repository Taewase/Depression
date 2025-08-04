import React from 'react';
import { 
  User, 
  FileText, 
  BookOpen, 
  Clock,
  Activity
} from 'lucide-react';

const RecentActivity = ({ activities = [], loading = false }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'assessment':
        return <FileText className="w-4 h-4" />;
      case 'article':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
      case 'assessment':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
      case 'article':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Recent Activity
        </h3>
        <Clock className="w-5 h-5 text-slate-400" />
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No recent activity
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {activity.user}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {activity.action}
                </p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {formatTimeAgo(activity.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity; 