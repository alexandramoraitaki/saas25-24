import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Dummy auth for placeholder
  const userRole = localStorage.getItem('role');
  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute; 