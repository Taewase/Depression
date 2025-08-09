import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  UserCheck, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  UserPlus,
  ClipboardCheck,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import AdminLayout from './components/AdminLayout';
import { getDashboardStats, getRecentActivity } from './api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date filter state - default to August 2025
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(8); // August

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats(selectedYear, selectedMonth);
      console.log('Dashboard data received:', data);
      setDashboardData(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent activity data
  const fetchRecentActivity = async () => {
    try {
      const data = await getRecentActivity();
      console.log('Recent activity data received:', data);
      setRecentActivity(data);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
    
    // Debug: Test user role
    const testUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://depression-41o5.onrender.com/api/debug/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log('User role debug:', data);
      } catch (error) {
        console.error('User role debug error:', error);
      }
    };
    testUserRole();
  }, [selectedYear, selectedMonth]);

  if (loading) {
    return (
      <AdminLayout pageName="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600 dark:text-slate-400">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout pageName="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600 dark:text-red-400">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  if (!dashboardData) {
    return (
      <AdminLayout pageName="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600 dark:text-slate-400">No data available</div>
        </div>
      </AdminLayout>
    );
  }

  // Debug logging
  console.log('Dashboard Data:', dashboardData);
  console.log('Risk Level Distribution:', dashboardData.riskLevelDistribution);
  console.log('Assessment Trends:', dashboardData.assessmentTrends);
  console.log('Demographics:', dashboardData.demographics);

  // Prepare stats cards data
  const stats = dashboardData?.stats ? [
    {
      title: "Total Users",
      value: (dashboardData.stats.total_users || 0).toLocaleString(),
      change: `${(dashboardData.stats.user_change || 0) >= 0 ? '+' : ''}${dashboardData.stats.user_change || 0}%`,
      changeType: (dashboardData.stats.user_change || 0) >= 0 ? "positive" : "negative",
      icon: Users
    },
    {
      title: "Assessments Taken",
      value: (dashboardData.stats.total_assessments || 0).toLocaleString(),
      change: `${(dashboardData.stats.assessment_change || 0) >= 0 ? '+' : ''}${dashboardData.stats.assessment_change || 0}%`,
      changeType: (dashboardData.stats.assessment_change || 0) >= 0 ? "positive" : "negative",
      icon: FileText
    },
    {
      title: "Active Users",
      value: (dashboardData.stats.active_users || 0).toLocaleString(),
      change: `${(dashboardData.stats.active_users || 0) > 0 ? '+' : ''}${dashboardData.stats.total_users > 0 ? (((dashboardData.stats.active_users || 0) / dashboardData.stats.total_users) * 100).toFixed(1) : 0}%`,
      changeType: "positive",
      icon: UserCheck
    },
    {
      title: "New This Week",
      value: (dashboardData.stats.new_users_week || 0).toLocaleString(),
      change: `${(dashboardData.stats.new_users_week || 0) > 0 ? '+' : ''}${dashboardData.stats.new_users_week || 0}`,
      changeType: "positive",
      icon: UserPlus
    }
  ] : [];

  // Prepare risk level data for pie chart
  const riskLevelData = (dashboardData.riskLevelDistribution || []).map((item, index) => ({
    name: item.final_class,
    value: parseFloat(item.percentage),
    count: parseInt(item.count),
    color: item.final_class === 'No Depression' ? '#06B6D4' :      // Cyan-500
           item.final_class === 'Mild Depression' ? '#3B82F6' :    // Blue-500
           item.final_class === 'Moderate Depression' ? '#6366F1' : // Indigo-500
           '#7C3AED'  // Violet-600
  }));

  // Prepare assessment trends data - handle monthly data starting from July 2025
  const assessmentData = (dashboardData.assessmentTrends || []).map((item, index) => {
    const dayDate = new Date(item.day);
    return {
      date: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: dayDate.toISOString().split('T')[0], // For debugging
      assessments: parseInt(item.assessments)
    };
  }).filter(item => {
    // Filter data to only show from July 2025 onwards
    const itemDate = new Date(item.fullDate);
    const startDate = new Date(2025, 6, 1); // July 1, 2025 (month is 0-indexed)
    return itemDate >= startDate;
  });

  // Prepare demographics data - fix property naming for chart
  const demographicsData = (dashboardData.demographics || []).reduce((acc, item) => {
    const existing = acc.find(d => d.ageGroup === item.age_group);
    const propertyName = item.final_class.toLowerCase().replace(/\s+/g, '').replace('depression', '');

    if (existing) {
      existing[propertyName] = parseInt(item.count);
    } else {
      const newItem = {
        ageGroup: item.age_group,
        [propertyName]: parseInt(item.count),
        no: 0,
        mild: 0,
        moderate: 0,
        severe: 0
      };
      newItem[propertyName] = parseInt(item.count);
      acc.push(newItem);
    }
    return acc;
  }, []);

  // Debug processed chart data
  console.log('Raw Dashboard Data:', dashboardData);
  console.log('Processed Risk Level Data:', riskLevelData);
  console.log('Processed Assessment Data:', assessmentData);
  console.log('Processed Demographics Data:', demographicsData);
  console.log('Stats Array:', stats);
  
  // Check for duplicate keys in demographics data
  const ageGroups = demographicsData.map(item => item.ageGroup);
  const duplicateAgeGroups = ageGroups.filter((item, index) => ageGroups.indexOf(item) !== index);
  if (duplicateAgeGroups.length > 0) {
    console.warn('Duplicate age groups found:', duplicateAgeGroups);
  }

  // Helper function to format time ago
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

  // Helper function to get activity icon and color
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_signup':
        return UserPlus;
      case 'assessment':
        return ClipboardCheck;
      case 'article':
        return FileText;
      default:
        return MessageSquare;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_signup':
        return 'text-green-600 dark:text-green-400';
      case 'assessment':
        return 'text-blue-600 dark:text-blue-400';
      case 'article':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  // Custom tooltip component for line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="text-slate-900 dark:text-slate-100 font-medium">{`Date: ${label}`}</p>
          <p className="text-slate-600 dark:text-slate-400">{`Assessments: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const BarChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="text-slate-900 dark:text-slate-100 font-medium">{`Age Group: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`bar-tooltip-${entry.dataKey}-${entry.name}-${index}`} className="text-slate-600 dark:text-slate-400">
              {`${entry.name}: ${entry.value || 0}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show loading state
  if (loading || !dashboardData) {
    return (
      <AdminLayout pageName="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout pageName="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchDashboardData();
                fetchRecentActivity();
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      pageName="Dashboard"
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      onYearChange={setSelectedYear}
      onMonthChange={setSelectedMonth}
    >
      <div className="space-y-6">
        {/* Dashboard Title */}
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Overview
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.length > 0 ? stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={`stat-card-${index}`} className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 truncate">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {stat.value}
                    </p>
                    <div className={`flex items-center text-sm font-medium ${
                      stat.changeType === 'positive' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="w-4 h-4 mr-1 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1 flex-shrink-0" />
                      )}
                      <span className="truncate">{stat.change}</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4 flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">No statistics available</p>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Assessments Over Time - Line Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              <span className="block sm:hidden">Assessments Over Time</span>
              <span className="hidden sm:block">Assessments Over Time - {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </h3>
            <div className="h-48 sm:h-64">
              {assessmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assessmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748B"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={12}
                      allowDecimals={false}
                      domain={[0, 'dataMax']}
                      tickFormatter={(value) => Math.round(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="assessments"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                  No assessment data available
                </div>
              )}
            </div>
          </div>
          
          {/* Risk Level Distribution - Donut Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Risk Level Distribution
          </h3>
            <div className="h-64 sm:h-80">
              {riskLevelData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskLevelData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskLevelData.map((entry, index) => (
                        <Cell key={`risk-cell-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                              <p className="text-slate-900 dark:text-slate-100 font-medium">{data.name}</p>
                              <p className="text-slate-600 dark:text-slate-400">{`Count: ${data.count}`}</p>
                              <p className="text-slate-600 dark:text-slate-400">{`Percentage: ${data.value}%`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => (
                        <span className="text-slate-700 dark:text-slate-300 text-xs">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                  No risk level data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demographics & Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Age Distribution by Risk Level - Bar Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              <span className="block sm:hidden">Age Distribution</span>
              <span className="hidden sm:block">Age Distribution by Risk Level</span>
            </h3>
            <div className="h-64 sm:h-80">
              {demographicsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demographicsData} barGap={8} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="ageGroup"
                      stroke="#64748B"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={12}
                    />
                    <Tooltip content={<BarChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-slate-700 dark:text-slate-300 text-sm">{value}</span>
                      )}
                    />
                    <Bar dataKey="no" stackId="a" fill="#06B6D4" name="No Depression" />
                    <Bar dataKey="mild" stackId="a" fill="#3B82F6" name="Mild Depression" />
                    <Bar dataKey="moderate" stackId="a" fill="#6366F1" name="Moderate Depression" />
                    <Bar dataKey="severe" stackId="a" fill="#7C3AED" name="Severe Depression" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                  No demographics data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="text-slate-500 dark:text-slate-400">
                    No recent activity
                  </div>
                </div>
              ) : (
                recentActivity.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);
                  return (
                    <div key={`activity-${activity.id || index}`} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className={`p-2 rounded-full bg-white dark:bg-slate-600 shadow-sm ${color} flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {activity.user}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {activity.action}
                        </p>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;