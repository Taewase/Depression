// API utility functions for admin dashboard

const API_BASE_URL = 'https://depression-41o5.onrender.com/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Dashboard statistics
export const getDashboardStats = async (year, month) => {
  const params = year && month ? `?year=${year}&month=${month}` : '';
  return apiCall(`/dashboard/stats${params}`);
};

// Users data
export const getUsers = async (page = 1, limit = 10) => {
  return apiCall(`/users?page=${page}&limit=${limit}`);
};

export const getUsersStats = async () => {
  return apiCall('/users/stats');
};

// Assessments data
export const getAssessments = async (page = 1, limit = 10) => {
  return apiCall(`/assessments?page=${page}&limit=${limit}`);
};

export const getAssessmentsCount = async () => {
  return apiCall('/assessments/count');
};

// Articles data
export const getArticles = async (page = 1, limit = 10) => {
  return apiCall(`/articles?page=${page}&limit=${limit}`);
};

export const getArticlesCount = async () => {
  return apiCall('/articles/count');
};

// Recent activity
export const getRecentActivity = async () => {
  return apiCall('/recent-activity');
};

// Demographics data
export const getDemographics = async () => {
  return apiCall('/admin/demographics');
};

// Mock data for development (remove when backend is ready)
export const getMockDashboardStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        users: {
          total: 1247,
          change: '+12%',
          changeType: 'positive',
          subtitle: 'Active registered users',
          trend: [1100, 1150, 1180, 1200, 1220, 1247],
          color: 'blue'
        },
        assessments: {
          total: 3421,
          change: '+8%',
          changeType: 'positive',
          subtitle: 'Completed assessments',
          trend: [3100, 3150, 3200, 3250, 3300, 3421],
          color: 'green'
        },
        articles: {
          total: 89,
          change: '+3',
          changeType: 'neutral',
          subtitle: 'Published articles',
          trend: [82, 84, 85, 86, 87, 89],
          color: 'purple'
        },
        recentAssessments: {
          total: 156,
          change: '+23%',
          changeType: 'positive',
          subtitle: 'This week',
          trend: [120, 125, 130, 140, 150, 156],
          color: 'orange'
        },
        averageScore: {
          total: 7.2,
          change: '+0.3',
          changeType: 'positive',
          subtitle: 'Out of 10',
          trend: [6.8, 6.9, 7.0, 7.1, 7.1, 7.2],
          color: 'indigo'
        },
        completionRate: {
          total: 94.5,
          change: '+2.1%',
          changeType: 'positive',
          subtitle: 'Assessment completion',
          trend: [92.0, 92.5, 93.0, 93.5, 94.0, 94.5],
          color: 'green'
        }
      });
    }, 1000); // Simulate network delay
  });
};

export const getMockRecentActivity = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          type: 'assessment',
          user: 'John Doe',
          action: 'completed assessment',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        },
        {
          id: 2,
          type: 'user',
          user: 'Jane Smith',
          action: 'registered',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        },
        {
          id: 3,
          type: 'assessment',
          user: 'Mike Johnson',
          action: 'completed assessment',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        },
        {
          id: 4,
          type: 'article',
          user: 'Admin',
          action: 'published new article',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          id: 5,
          type: 'user',
          user: 'Sarah Wilson',
          action: 'registered',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        }
      ]);
    }, 800);
  });
};