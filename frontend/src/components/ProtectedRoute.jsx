// src/components/ProtectedRoute.jsx - IMPROVED VERSION
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, requireAuth = true }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  // Show elegant loading spinner
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // No authentication required for this route
  if (!requireAuth) {
    return children;
  }

  // Authentication required but user not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // Admin access required but user not admin
  if (adminOnly && !isAdmin) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You need administrator privileges to access this page.</p>
        <p>Current user: {user?.username}</p>
        <button onClick={() => window.history.back()} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;