import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';

import Navigation from './components/Navigation';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Resources from './pages/Resources';
import Support from './pages/Support';
import Login from './Auth/Login';
import Register from './Auth/Register';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Results from './pages/Results';
import ArticleView from './pages/ArticleView';
import { useAuth } from './context/AuthContext';

// Layout for public pages
const PublicLayout = () => (
  <div className="font-sans antialiased text-gray-900 bg-gray-50">
    <Navigation />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Wrapper to protect routes that require authentication
const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />;
};

// Assessment route that works for both authenticated and non-authenticated users
function AssessmentRoute() {
  const { isAuthenticated } = useAuth();
  
  // If authenticated, redirect to the protected assessment route
  if (isAuthenticated) {
    return <Navigate to="/dashboard/assessment" replace />;
  }
  
  // If not authenticated, show the standalone assessment
  return <Assessment />;
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated } = useAuth();

  const handleSplashComplete = () => {
    console.log('Splash screen completed, redirecting to home...');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  console.log('Rendering main app, showSplash:', showSplash, 'isAuthenticated:', isAuthenticated);

  return (
    <Routes>
      {/* Public routes that are accessible to everyone */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="assessment" element={<AssessmentRoute />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Protected routes that require authentication */}
      <Route element={<ProtectedRoutes />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard/assessment" element={<Assessment />} />
        <Route path="results" element={<Results />} />
        <Route path="resources" element={<Resources />} />
        <Route path="article/:id" element={<ArticleView />} />
        <Route path="support" element={<Support />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback route to redirect unhandled paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
