// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default ProtectedRoute;