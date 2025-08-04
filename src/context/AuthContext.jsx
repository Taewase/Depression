import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000';

const fetchAssessmentHistory = async (setAssessmentHistory) => {
  const token = localStorage.getItem('token');
  if (!token) return setAssessmentHistory([]);
  try {
    const res = await fetch('http://localhost:5000/api/assessment-history', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch assessment history');
    const data = await res.json();
    setAssessmentHistory(data);
  } catch (err) {
    setAssessmentHistory([]);
  }
};

const fetchUserProfile = async (setUser, logout) => {
  const token = localStorage.getItem('token');
  if (!token) {
    setUser(null);
    return;
  }
  try {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Invalid token');
    const data = await res.json();
    setUser(data.user);
  } catch (err) {
    // Token is invalid or expired, log out
    logout();
  }
};

// Helper to calculate streak
const calculateWellnessStreak = (activityList) => {
  if (!activityList || activityList.length === 0) return 0;
  // Get unique days with activity
  const days = Array.from(new Set(activityList.map(a => a.date))).sort((a, b) => new Date(b) - new Date(a));
  if (days.length === 0) return 0;
  let streak = 1;
  let prev = new Date(days[0]);
  for (let i = 1; i < days.length; i++) {
    const curr = new Date(days[i]);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
      prev = curr;
    } else {
      break;
    }
  }
  return streak;
};

export const AuthProvider = ({ children }) => {
  // Change password API call
  const changePassword = async (currentPassword, newPassword) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to change password');
    }
    return await res.json();
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]); // Start empty
  const [recentActivity, setRecentActivity] = useState([]); // Start empty
  const navigate = useNavigate();

  // Debug authentication state changes
  useEffect(() => {
    console.log('AuthContext: Authentication state changed to:', isAuthenticated);
  }, [isAuthenticated]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setIsAuthenticated(true);
      setUser(data.user);
      await fetchAssessmentHistory(setAssessmentHistory);
      
      // Redirect based on user role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setAssessmentHistory([]);
    setRecentActivity([]);
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and fetch user profile
      fetchUserProfile(setUser, logout).then(() => {
        setIsAuthenticated(true);
        fetchAssessmentHistory(setAssessmentHistory);
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setAssessmentHistory([]);
      setRecentActivity([]);
    }
    // eslint-disable-next-line
  }, []);

  const updateUserProfile = (updatedData) => {
    // In a real app, you'd make an API call here
    setUser(prevUser => ({
      ...prevUser,
      ...updatedData
    }));
  };

  // Remove or update addAssessmentResult to not use local mock data

  const addActivity = (type, description) => {
    const newActivity = {
      id: Date.now(),
      type,
      desc: description,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
  };

  // Calculate dynamic stats
  const getDashboardStats = () => {
    const completedAssessments = assessmentHistory.length;
    const lastAssessment = assessmentHistory[0];
    const lastScore = lastAssessment ? lastAssessment.final_class : 'No assessments yet';
    const lastConfidence = lastAssessment ? lastAssessment.confidence : null;
    const resourcesAccessed = recentActivity.filter(a => a.type === 'Resource').length;
    const wellnessStreak = calculateWellnessStreak(recentActivity);
    return {
      completedAssessments,
      lastScore,
      lastConfidence,
      resourcesAccessed,
      wellnessStreak
    };
  };

  // Memoize fetchAssessmentHistory to prevent infinite re-renders
  const memoizedFetchAssessmentHistory = useCallback(() => {
    return fetchAssessmentHistory(setAssessmentHistory);
  }, []);

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUserProfile,
    changePassword,
    assessmentHistory,
    recentActivity,
    addActivity,
    getDashboardStats,
    fetchAssessmentHistory: memoizedFetchAssessmentHistory,
    calculateWellnessStreak, // export for use if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useIsAdmin = () => {
  const { user } = useAuth();
  return user && user.role === 'admin';
}; 