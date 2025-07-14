import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const mockUser = {
  name: 'Maiwase Zulu',
  email: 'maiwasezulu@gmail.com',
  role: 'Guest',
  phone: '+1234567890',
  address: 'Lilongwe, Malawi',
  joinDate: 'January 2024',
};

// Mock assessment history
const mockAssessmentHistory = [
  {
    id: 1,
    date: '2024-01-15',
    score: 5,
    level: 'Optimal Wellness',
    questions: 20,
    completed: true,
    recommendations: [
      'Continue your excellent self-care routine',
      'Share your wellness strategies with friends',
      'Consider becoming a peer supporter'
    ]
  },
  {
    id: 2,
    date: '2024-01-10',
    score: 12,
    level: 'Mindful Attention',
    questions: 20,
    completed: true,
    recommendations: [
      'Connect with a mental health professional',
      'Explore stress management techniques',
      'Build stronger support networks'
    ]
  },
  {
    id: 3,
    date: '2024-01-05',
    score: 8,
    level: 'Optimal Wellness',
    questions: 20,
    completed: true,
    recommendations: [
      'Continue your excellent self-care routine',
      'Schedule quarterly mental health check-ins'
    ]
  }
];

// Mock recent activity
const mockRecentActivity = [
  { id: 1, type: 'Assessment', desc: 'Completed mental wellness check', date: '2024-01-15', time: '2:30 PM' },
  { id: 2, type: 'Resource', desc: 'Read "Coping with Stress" article', date: '2024-01-14', time: '11:45 AM' },
  { id: 3, type: 'Support', desc: 'Joined peer support group', date: '2024-01-12', time: '3:20 PM' },
  { id: 4, type: 'Assessment', desc: 'Completed assessment', date: '2024-01-10', time: '1:15 PM' },
  { id: 5, type: 'Resource', desc: 'Accessed meditation guide', date: '2024-01-08', time: '9:30 AM' },
];

const API_URL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState(mockAssessmentHistory);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);
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
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Optionally fetch user profile here
    }
  }, []);

  const updateUserProfile = (updatedData) => {
    // In a real app, you'd make an API call here
    setUser(prevUser => ({
      ...prevUser,
      ...updatedData
    }));
  };

  const addAssessmentResult = (result) => {
    const newAssessment = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      score: result.score,
      level: result.level,
      questions: 20,
      completed: true,
      recommendations: result.recommendations
    };
    
    setAssessmentHistory(prev => [newAssessment, ...prev]);
    
    // Add to recent activity
    const newActivity = {
      id: Date.now(),
      type: 'Assessment',
      desc: `Completed ${result.level} assessment`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]); // Keep only 5 most recent
  };

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
    const completedAssessments = assessmentHistory.filter(a => a.completed).length;
    const lastAssessment = assessmentHistory[0];
    const lastScore = lastAssessment ? lastAssessment.level : 'No assessments yet';
    const resourcesAccessed = recentActivity.filter(a => a.type === 'Resource').length;
    
    return {
      completedAssessments,
      lastScore,
      resourcesAccessed
    };
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUserProfile,
    assessmentHistory,
    recentActivity,
    addAssessmentResult,
    addActivity,
    getDashboardStats,
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