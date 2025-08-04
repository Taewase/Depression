import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Download,
  Filter,
  Search,
  Clock
} from 'lucide-react';

// Helper to generate recommendations based on final_class
const getRecommendations = (final_class) => {
  switch (final_class) {
    case 'Severe Depression':
      return [
        'Contact a mental health professional immediately',
        'Reach out to your doctor or a mental health crisis line',
        'Connect with emergency mental health services if needed',
        'Consider immediate professional support through our partner platforms',
        "Don't hesitate to reach out to trusted friends or family"
      ];
    case 'Moderate Depression':
      return [
        'Contact a mental health professional for evaluation',
        'Reach out to your doctor or a mental health professional',
        'Consider therapy or counseling services',
        'Build stronger support networks with friends and family',
        'Practice self-care and stress management techniques'
      ];
    case 'Mild Depression':
      return [
        'Consider consulting with a mental health professional',
        'Practice regular self-care and stress management',
        'Stay connected with supportive friends and family',
        'Engage in regular physical activity and mindfulness',
        'Monitor your mental health and seek help if symptoms worsen'
      ];
    case 'No Depression':
      return [
        'Continue practicing self-care and healthy lifestyle habits',
        'Stay connected with supportive friends and family',
        'Engage in regular physical activity and mindfulness',
        'Schedule regular mental health check-ins with yourself',
        'Consider periodic mental health screenings'
      ];
    default:
      return [];
  }
};

const Results = () => {
  const { assessmentHistory } = useAuth();
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  // Use final_class for filtering and display
  const filteredAssessments = assessmentHistory.filter(assessment => {
    const matchesSearch = assessment.final_class && assessment.final_class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || assessment.final_class === filterLevel;
    return matchesSearch && matchesFilter;
  });

  // Compute unique final_class values for filter dropdown
  const uniqueClasses = Array.from(new Set(assessmentHistory.map(a => a.final_class).filter(Boolean)));

  const getLevelColor = (level) => {
    switch (level) {
      case 'Optimal Wellness':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'Mindful Attention':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'Enhanced Support':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400';
      case 'Professional Care':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const exportResults = () => {
    // In a real app, this would generate and download a PDF/CSV
    alert('Export functionality would generate a detailed report');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assessment Results</h1>
          <p className="text-gray-600 dark:text-gray-400">View your mental wellness journey and track your progress</p>
        </div>
        {/* Removed Export Results Button */}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Assessment History</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredAssessments.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No assessments found
                </div>
              ) : (
                filteredAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    onClick={() => setSelectedAssessment(assessment)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                      selectedAssessment?.id === assessment.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(assessment.final_class)}`}>
                        {assessment.final_class}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(assessment.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <BarChart3 className="w-4 h-4" />
                      Score: {assessment.total_score ?? 0}/20
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-2">
          {selectedAssessment ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Assessment Results
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Date: {selectedAssessment.created_at ? formatDate(selectedAssessment.created_at) : 'Unknown'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        20 questions
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedAssessment.final_class)}`}>
                    {selectedAssessment.final_class}
                  </span>
                </div>

                {/* Score Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedAssessment.total_score}/20
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Total Score</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recommendations
                  </h3>
                  <div className="space-y-3">
                    {getRecommendations(selectedAssessment.final_class).length > 0 ? (
                      getRecommendations(selectedAssessment.final_class).map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 dark:text-gray-300">{rec}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No recommendations available.</div>
                    )}
                  </div>
                </div>

                {/* Progress Insights */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Progress Insights</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on your assessment results, you're showing positive mental wellness indicators. 
                    Continue with your current self-care practices and consider exploring additional resources 
                    to maintain your well-being.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select an Assessment
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose an assessment from the list to view detailed results and recommendations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results; 