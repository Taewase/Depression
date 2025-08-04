import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProgressTracker = () => {
  const [formattedData, setFormattedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const { assessmentHistory, fetchAssessmentHistory } = useAuth();

  useEffect(() => {
    // Refresh assessment history when component mounts
    const loadData = async () => {
      setLoading(true);
      await fetchAssessmentHistory();
      setLoading(false);
    };
    loadData();
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    // Format data for the chart whenever assessmentHistory changes
    if (assessmentHistory && assessmentHistory.length > 0) {
      // Sort by date first to ensure proper ordering
      const sortedHistory = [...assessmentHistory].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      const formatted = sortedHistory.map((assessment, index) => ({
        ...assessment,
        date: new Date(assessment.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        assessmentNumber: index + 1,
        month: new Date(assessment.created_at).getMonth() + 1, // 1-12
        year: new Date(assessment.created_at).getFullYear(),
        // Ensure total_score is a number
        total_score: parseInt(assessment.total_score) || 0
      }));
      setFormattedData(formatted);
    } else {
      setFormattedData([]);
    }
    setLoading(false);
  }, [assessmentHistory]);

  // Filter data based on selected month and year
  useEffect(() => {
    let filtered = formattedData;
    
    if (selectedMonth) {
      filtered = filtered.filter(item => item.month === parseInt(selectedMonth));
    }
    
    if (selectedYear) {
      filtered = filtered.filter(item => item.year === parseInt(selectedYear));
    }
    
    // Sort filtered data by date to ensure proper line connection
    filtered = filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    setFilteredData(filtered);
  }, [formattedData, selectedMonth, selectedYear]);

  // Generate year options starting from July 2025
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2025;
    const years = [];
    
    for (let year = startYear; year <= Math.max(currentYear, startYear + 5); year++) {
      years.push(year);
    }
    
    return years;
  };

  const monthOptions = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const getTrendIcon = () => {
    const dataToUse = filteredData.length > 0 ? filteredData : formattedData;
    if (dataToUse.length < 2) return <Minus className="w-5 h-5 text-gray-500" />;
    
    const firstScore = dataToUse[0].total_score;
    const lastScore = dataToUse[dataToUse.length - 1].total_score;
    
    if (lastScore < firstScore) {
      return <TrendingDown className="w-5 h-5 text-green-500" />; // Lower score is better
    } else if (lastScore > firstScore) {
      return <TrendingUp className="w-5 h-5 text-red-500" />; // Higher score indicates more symptoms
    } else {
      return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    const dataToUse = filteredData.length > 0 ? filteredData : formattedData;
    if (dataToUse.length < 2) return "Not enough data to show trend";
    
    const firstScore = dataToUse[0].total_score;
    const lastScore = dataToUse[dataToUse.length - 1].total_score;
    const difference = Math.abs(lastScore - firstScore);
    
    if (lastScore < firstScore) {
      return `Improvement: ${difference} points lower than first assessment`;
    } else if (lastScore > firstScore) {
      return `Increase: ${difference} points higher than first assessment`;
    } else {
      return "Stable: No change from first assessment";
    }
  };

  const getScoreInterpretation = (score) => {
    if (score >= 0 && score <= 7) {
      return { level: "Minimal", color: "text-green-600", bgColor: "bg-green-100" };
    } else if (score >= 8 && score <= 10) {
      return { level: "Mild", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    } else if (score >= 11 && score <= 15) {
      return { level: "Moderate", color: "text-orange-600", bgColor: "bg-orange-100" };
    } else {
      return { level: "Severe", color: "text-red-600", bgColor: "bg-red-100" };
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const interpretation = getScoreInterpretation(data.total_score);
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Assessment #${label}`}</p>
          <p className="text-gray-600 text-sm">{`Date: ${data.date}`}</p>
          <p className="text-indigo-600">{`Score: ${data.total_score}/20`}</p>
          <p className={`${interpretation.color} font-medium`}>
            Level: {interpretation.level}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Classification: {data.final_class}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (formattedData.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No assessment history</h3>
        <p className="mt-1 text-sm text-gray-500">
          Take your first assessment to start tracking your mental health progress.
        </p>
        <div className="mt-6">
          <button
            onClick={() => window.location.href = '/dashboard/assessment'}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  const dataToDisplay = filteredData.length > 0 ? filteredData : formattedData;
  

  
  const latestAssessment = dataToDisplay[dataToDisplay.length - 1];
  const latestInterpretation = latestAssessment ? getScoreInterpretation(latestAssessment.total_score) : null;

  // Prepare chart data outside JSX for performance and clarity
  const chartData = dataToDisplay
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((item, index) => ({
      assessment: index + 1,
      score: Number(item.total_score) || 0,
      date: item.date,
      classification: item.final_class
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Progress Tracker</h1>
            <p className="text-gray-600 mt-1">
              Track how your mental well-being has changed with each assessment over time
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formattedData.length} assessments completed</span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter Assessments
          </h2>
          <button
            onClick={() => {
              setSelectedMonth('');
              setSelectedYear('');
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Clear Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Filter by Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Filter by Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Years</option>
              {getYearOptions().map((year) => (
                <option key={year} value={year} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(selectedMonth || selectedYear) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Showing {dataToDisplay.length} assessment{dataToDisplay.length !== 1 ? 's' : ''} 
              {selectedMonth && ` for ${monthOptions.find(m => m.value === selectedMonth)?.label}`}
              {selectedYear && ` in ${selectedYear}`}
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Latest Score */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Latest Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {latestAssessment ? `${latestAssessment.total_score}/20` : 'N/A'}
              </p>
            </div>
            <div className={`${latestInterpretation ? latestInterpretation.bgColor : 'bg-gray-100 dark:bg-gray-800'} p-3 rounded-full`}>
              <BarChart3 className={`w-6 h-6 ${latestInterpretation ? latestInterpretation.color : 'text-gray-400'}`} />
            </div>
          </div>
          <div className="mt-4">
            {latestInterpretation ? (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${latestInterpretation.bgColor} ${latestInterpretation.color}`}>{latestInterpretation.level} Level</span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">No Data</span>
            )}
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Overall Trend</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{getTrendText()}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
              {getTrendIcon()}
            </div>
          </div>
        </div>

        {/* Assessment Count */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dataToDisplay.length}</p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
              <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {dataToDisplay.length > 0 ? `Since ${new Date(dataToDisplay[0].created_at).toLocaleDateString()}` : 'No data available'}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Assessment Trend Over Time</h2>
          <p className="text-sm text-gray-600 mt-1">
            Your SRQ-20 scores plotted over time. Lower scores indicate fewer symptoms.
          </p>
        </div>

        {chartData.length < 2 ? (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Not enough data for a trend line</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add more assessments to see your progress over time.
            </p>
          </div>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {/* Dynamic chart colors for dark mode */}
              {(() => {
                const isDarkMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                const gridColor = isDarkMode ? '#334155' : '#f0f0f0';
                const axisColor = isDarkMode ? '#CBD5E1' : '#6b7280';
                const lineColor = isDarkMode ? '#A78BFA' : '#4f46e5';
                const dotColor = isDarkMode ? '#A78BFA' : '#4f46e5';
                return (
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="assessment" 
                      stroke={axisColor}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={axisColor}
                      fontSize={12}
                      domain={[0, 20]}
                      label={{ value: 'SRQ-20 Score', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const interpretation = getScoreInterpretation(data.score);
                        return (
                          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-700">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{`Assessment #${data.assessment}`}</p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{`Date: ${data.date}`}</p>
                            <p className="text-indigo-600 dark:text-indigo-400">{`Score: ${data.score}/20`}</p>
                            <p className={`${interpretation.color} font-medium`}>
                              Level: {interpretation.level}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                              Classification: {data.classification}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke={lineColor}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: isDarkMode ? '#1e293b' : '#ffffff', stroke: lineColor, strokeWidth: 2 }}
                      name="SRQ-20 Score"
                      connectNulls={true}
                    />
                  </LineChart>
                );
              })()}
            </ResponsiveContainer>
          </div>
        )}

        {/* Score Interpretation Guide */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Score Interpretation Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>0-7: Minimal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>8-10: Mild</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>11-15: Moderate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>16-20: Severe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assessments Table - Responsive */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Assessments</h2>
        {dataToDisplay.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No assessments found for the selected filters.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Classification</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {dataToDisplay.slice(-5).reverse().map((assessment) => {
                    const interpretation = getScoreInterpretation(assessment.total_score);
                    return (
                      <tr key={assessment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{assessment.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{assessment.total_score}/20</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${interpretation.bgColor} ${interpretation.color}`}>{interpretation.level}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{assessment.final_class}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {dataToDisplay.slice(-5).reverse().map((assessment) => {
                const interpretation = getScoreInterpretation(assessment.total_score);
                return (
                  <div key={assessment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{assessment.date}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${interpretation.bgColor} ${interpretation.color}`}>{interpretation.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Score</span>
                        <span className="block text-lg font-bold text-indigo-600 dark:text-indigo-400">{assessment.total_score}/20</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Classification</span>
                        <span className="block text-xs text-gray-700 dark:text-gray-300">{assessment.final_class}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;