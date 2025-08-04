import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  change, 
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  loading = false,
  trend = [], // Array of recent values for mini chart
  color = 'indigo', // 'indigo', 'blue', 'green', 'purple', 'orange', 'red'
  size = 'default' // 'default', 'large'
}) => {
  const getColorClasses = () => {
    const colorMap = {
      indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-900',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-700',
        hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-800'
      },
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-700',
        hover: 'hover:bg-blue-50 dark:hover:bg-blue-800'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-700',
        hover: 'hover:bg-green-50 dark:hover:bg-green-800'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-700',
        hover: 'hover:bg-purple-50 dark:hover:bg-purple-800'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-700',
        hover: 'hover:bg-orange-50 dark:hover:bg-orange-800'
      },
      red: {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-700',
        hover: 'hover:bg-red-50 dark:hover:bg-red-800'
      }
    };
    return colorMap[color] || colorMap.indigo;
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      default:
        return '→';
    }
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const renderMiniChart = () => {
    if (!trend || trend.length < 2) return null;
    
    const maxValue = Math.max(...trend);
    const minValue = Math.min(...trend);
    const range = maxValue - minValue || 1;
    
    return (
      <div className="flex items-end space-x-1 h-8 mt-2">
        {trend.map((point, index) => {
          const height = ((point - minValue) / range) * 100;
          return (
            <div
              key={index}
              className={`flex-1 rounded-sm ${getColorClasses().bg} ${getColorClasses().text}`}
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 ${size === 'large' ? 'sm:p-8' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getColorClasses().bg} rounded-xl animate-pulse flex-shrink-0`}></div>
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-5 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2"></div>
              {subtitle && (
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3 mt-1"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 ${getColorClasses().hover} ${size === 'large' ? 'sm:p-8' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center">
          {Icon && (
            <div className={`p-2 sm:p-3 ${getColorClasses().bg} rounded-xl flex-shrink-0`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${getColorClasses().text}`} />
            </div>
          )}
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
              {title}
            </p>
            <p className={`font-bold text-slate-900 dark:text-slate-100 ${size === 'large' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
              {formatValue(value)}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {change && (
          <div className={`text-left sm:text-right ${getChangeColor()} flex-shrink-0`}>
            <div className="flex items-center text-sm font-medium">
              <span className="mr-1 text-lg">{getChangeIcon()}</span>
              {change}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              vs last period
            </p>
          </div>
        )}
      </div>
      
      {renderMiniChart()}
    </div>
  );
};

export default StatCard; 