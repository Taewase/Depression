import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const isAdmin = useIsAdmin();
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default AdminRoute; 