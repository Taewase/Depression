import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  FileDown,
  X
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { useNotification } from '../components/NotificationProvider';

const AssessmentPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const { showNotification } = useNotification();
  const [seenAssessmentIds, setSeenAssessmentIds] = useState(new Set());

  const itemsPerPage = 10;

  // SRQ-20 Questions mapping
  const srqQuestions = {
    q1_answer: "Do you often have headaches?",
    q2_answer: "Is your appetite poor?",
    q3_answer: "Do you sleep badly?",
    q4_answer: "Are you easily frightened?",
    q5_answer: "Do your hands shake?",
    q6_answer: "Do you feel nervous, tense or worried?",
    q7_answer: "Is your digestion poor?",
    q8_answer: "Do you have trouble thinking clearly?",
    q9_answer: "Do you feel unhappy?",
    q10_answer: "Do you cry more than usual?",
    q11_answer: "Do you find it difficult to enjoy your daily activities?",
    q12_answer: "Do you find it difficult to make decisions?",
    q13_answer: "Is your daily work suffering?",
    q14_answer: "Are you unable to play a useful part in life?",
    q15_answer: "Do you lose interest in things?",
    q16_answer: "Do you feel that you are a worthless person?",
    q17_answer: "Has the thought of ending your life been on your mind?",
    q18_answer: "Do you feel tired all the time?",
    q19_answer: "Do you have uncomfortable feelings in your stomach?",
    q20_answer: "Are you easily tired?"
  };

  // Fetch assessments with pagination and filters
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        final_class: selectedClass,
        gender: selectedGender
      });

      const response = await fetch(`https://depression-41o5.onrender.com/api/assessments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure backend returns assessments sorted by newest first
        const sortedAssessments = data.assessments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setAssessments(sortedAssessments);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
        // Notification logic for true new submissions
        const newIds = sortedAssessments
          .map(a => a.id)
          .filter(id => !seenAssessmentIds.has(id));
        if (newIds.length > 0) {
          newIds.forEach(() => {
            showNotification && showNotification('New assessment submitted!', 'success');
          });
          setSeenAssessmentIds(prev => {
            const updated = new Set(prev);
            newIds.forEach(id => updated.add(id));
            return updated;
          });
        }
      } else {
        setError('Failed to fetch assessments');
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setError('Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details for drawer
  const fetchUserDetails = async (userId) => {
    try {
      setLoadingUserDetails(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://depression-41o5.onrender.com/api/assessments/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUserDetails(data);
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // Handle view assessment
  const handleViewAssessment = async (assessment) => {
    setSelectedAssessment(assessment);
    setShowDrawer(true);
    await fetchUserDetails(assessment.user_id);
  };

  // Handle download single assessment
  const handleDownloadAssessment = async (assessment) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://depression-41o5.onrender.com/api/assessments/${assessment.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assessment_${assessment.id}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading assessment:', error);
    }
  };

  // Handle export all assessments
  const handleExportAll = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        search: searchTerm,
        final_class: selectedClass,
        gender: selectedGender
      });

      const response = await fetch(`https://depression-41o5.onrender.com/api/assessments/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all_assessments.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting assessments:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get risk level color
  const getRiskLevelColor = (finalClass) => {
    switch (finalClass) {
      case 'No Depression':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'Mild Depression':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'Moderate Depression':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400';
      case 'Severe Depression':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default:
        return 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [currentPage, searchTerm, selectedClass, selectedGender]);

  if (loading) {
    return (
      <AdminLayout pageName="Assessments">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600 dark:text-slate-400">Loading assessments...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout pageName="Assessments">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600 dark:text-red-400">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageName="Assessments">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Assessment Results
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              View and manage user assessment data and results
            </p>
          </div>
          <button
            onClick={handleExportAll}
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export All
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Final Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              <option value="No Depression">No Depression</option>
              <option value="Mild Depression">Mild Depression</option>
              <option value="Moderate Depression">Moderate Depression</option>
              <option value="Severe Depression">Severe Depression</option>
            </select>

            {/* Gender Filter */}
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('');
                setSelectedGender('');
              }}
              className="flex items-center justify-center px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Clear Filters</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        </div>

        {/* Assessment Table - Desktop */}
        <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Final Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {assessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {formatDate(assessment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {assessment.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {assessment.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {assessment.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {assessment.total_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(assessment.final_class)}`}>
                        {assessment.final_class}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {assessment.confidence}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewAssessment(assessment)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadAssessment(assessment)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* Assessment Cards - Mobile/Tablet */}
        <div className="md:hidden space-y-4">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">ID:</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{assessment.user_id}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(assessment.created_at)}</p>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => handleViewAssessment(assessment)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadAssessment(assessment)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-green-600 dark:text-green-400"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Age:</span>
                  <span className="ml-1 text-slate-900 dark:text-slate-100">{assessment.age}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Gender:</span>
                  <span className="ml-1 text-slate-900 dark:text-slate-100">{assessment.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Score:</span>
                  <span className="ml-1 text-slate-900 dark:text-slate-100">{assessment.total_score}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Confidence:</span>
                  <span className="ml-1 text-slate-900 dark:text-slate-100">{assessment.confidence}%</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(assessment.final_class)}`}>
                  {assessment.final_class}
                </span>
              </div>
            </div>
          ))}
        </div>

          {/* Pagination */}
          <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Drawer */}
        {showDrawer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Assessment Details
                </h2>
                <button
                  onClick={() => {
                    setShowDrawer(false);
                    setSelectedAssessment(null);
                    setSelectedUserDetails(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {loadingUserDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-slate-600 dark:text-slate-400">Loading details...</div>
                  </div>
                ) : selectedUserDetails ? (
                  <div className="space-y-6">
                    {/* Assessment Summary */}
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        Assessment Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">User ID</p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{selectedAssessment.user_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Date</p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{formatDate(selectedAssessment.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Age</p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{selectedAssessment.age}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Gender</p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{selectedAssessment.gender}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Score</p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{selectedAssessment.total_score}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Final Class</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(selectedAssessment.final_class)}`}>
                            {selectedAssessment.final_class}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Confidence</p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{selectedAssessment.confidence}%</p>
                        </div>
                      </div>
                    </div>

                    {/* SRQ-20 Questions and Answers */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        SRQ-20 Questions & Answers
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(srqQuestions).map(([key, question]) => {
                          const answer = selectedUserDetails[key];
                          return (
                            <div key={key} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                                {question}
                              </p>
                              <p className={`text-sm ${answer === 'Yes' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                Answer: {answer || 'No'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-slate-600 dark:text-slate-400">No details available</div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => selectedAssessment && handleDownloadAssessment(selectedAssessment)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AssessmentPage;