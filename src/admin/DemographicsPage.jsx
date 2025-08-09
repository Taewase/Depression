import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Users, 
  RefreshCw,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import AdminLayout from './components/AdminLayout';
import { useNotification } from '../components/NotificationProvider';

const ageColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const genderColors = ['#3B82F6', '#EC4899', '#8B5CF6'];

const getGenderDisplayName = (gender) => gender || 'Unknown';
const processGenderData = (genderData) => {
  if (!genderData || !Array.isArray(genderData)) return [];
  return genderData.map(item => ({
    name: getGenderDisplayName(item.gender),
    value: parseInt(item.count) || 0,
    count: parseInt(item.count) || 0,
    percentage: parseFloat(item.percentage) || 0,
    gender: item.gender
  }));
};

const DemographicsPage = () => {
  const [demographicsData, setDemographicsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  // Fetch demographics data
  const fetchDemographicsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://depression-41o5.onrender.com/api/admin/demographics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDemographicsData(data);
      } else {
        setError('Failed to fetch demographics data');
      }
    } catch (error) {
      setError('Failed to fetch demographics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemographicsData();
  }, []);

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Age Group: ${label}`}</p>
          <p className="text-blue-600">{`Count: ${payload[0].value}`}</p>
          <p className="text-green-600">{`Percentage: ${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Gender: ${data.name}`}</p>
          <p className="text-blue-600">{`Count: ${data.count}`}</p>
          <p className="text-green-600">{`Percentage: ${data.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Prepare gender chart content
  const genderPieData = demographicsData?.genderDistribution ? processGenderData(demographicsData.genderDistribution) : [];
  let genderChartContent;
  if (genderPieData.length > 0) {
    genderChartContent = (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={genderPieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {genderPieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={genderColors[index % genderColors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    );
  } else {
    genderChartContent = (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No gender distribution data available</p>
      </div>
    );
  }

  if (loading) {
    return (
      <AdminLayout pageName="Demographics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout pageName="Demographics">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageName="Demographics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              <span className="hidden sm:inline">Demographics Analysis</span>
              <span className="sm:hidden">Demographics</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">Age and gender distribution from assessment results</span>
              <span className="sm:hidden">User distribution analysis</span>
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchDemographicsData}
              className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {demographicsData?.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{demographicsData.summary.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Age</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{demographicsData.summary.averageAge}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border dark:border-gray-700 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span className="hidden sm:inline">Most Common Age Group</span>
                    <span className="sm:hidden">Common Age Group</span>
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{demographicsData.summary.mostCommonAgeGroup}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Age Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Age Distribution</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="hidden sm:inline">Distribution of users by age groups</span>
                  <span className="sm:hidden">Users by age groups</span>
                </p>
              </div>
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            </div>
            
            {demographicsData?.ageDistribution && demographicsData.ageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={demographicsData.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="age_group" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <p className="text-gray-500 dark:text-gray-400">No age distribution data available</p>
              </div>
            )}
            {/* Age Distribution Table */}
            {demographicsData?.ageDistribution && demographicsData.ageDistribution.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Detailed Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Age Group</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Count</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {demographicsData.ageDistribution.map((item, index) => (
                        <tr key={item.age_group}>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{item.age_group}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{item.count}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Gender Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Gender Distribution</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="hidden sm:inline">Distribution of users by gender</span>
                  <span className="sm:hidden">Users by gender</span>
                </p>
              </div>
              <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
            </div>
            <div className="h-48 sm:h-64">
              {genderPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={genderPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={genderColors[index % genderColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">No gender distribution data available</p>
                </div>
              )}
            </div>
            {/* Gender Distribution Table */}
            {demographicsData?.genderDistribution && demographicsData.genderDistribution.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Detailed Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Gender</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Count</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {demographicsData.genderDistribution.map((item, index) => (
                        <tr key={item.gender}>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{getGenderDisplayName(item.gender)}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{item.count}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Source Information */}
        <div className="bg-blue-50 dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-gray-700">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-gray-100">Data Source</h4>
              <p className="text-sm text-blue-700 dark:text-gray-300 mt-1">
                All demographic data is sourced from the assessment_results table, which contains age and gender information 
                collected during user assessments. The data is automatically grouped and calculated in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DemographicsPage;
