import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const API_URL = 'https://depression-41o5.onrender.com';

const fetchAssessmentHistory = async (setAssessmentHistory) => {
  const token = localStorage.getItem('token');
  if (!token) return setAssessmentHistory([]);
  try {
    const res = await fetch('https://depression-41o5.onrender.com/api/assessment-history', {
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

const calculateWellnessStreak = (assessmentHistory) => {
  if (!assessmentHistory || assessmentHistory.length === 0) return 0;
  
  // Sort assessments by date (most recent first)
  const sortedAssessments = [...assessmentHistory].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedAssessments.length; i++) {
    const assessmentDate = new Date(sortedAssessments[i].created_at);
    assessmentDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - assessmentDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
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
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();

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

  const addAssessmentResult = (result) => {
    setAssessmentHistory(prev => [result, ...prev]);
  };

  const addActivity = (type, desc) => {
    const newActivity = {
      id: Date.now(),
      type,
      desc,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
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
    assessmentHistory,
    addAssessmentResult,
    recentActivity,
    addActivity,
    fetchAssessmentHistory: memoizedFetchAssessmentHistory,
    changePassword,
    getDashboardStats: () => ({
      completedAssessments: assessmentHistory.length,
      lastScore: assessmentHistory.length > 0 ? `${assessmentHistory[0].final_class}` : 'No assessments yet',
      lastConfidence: assessmentHistory.length > 0 ? `${Math.round(assessmentHistory[0].confidence * 100)}%` : 'N/A',
      wellnessStreak: calculateWellnessStreak(assessmentHistory)
    })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useIsAdmin = () => {
  const { user, isAuthenticated } = useAuth();
  return isAuthenticated && user && user.role === 'admin';
};