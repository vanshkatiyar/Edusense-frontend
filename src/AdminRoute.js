import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  // If user is not logged in OR the user is not an admin,
  // redirect them to the main dashboard page.
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // If the user is an admin, render the requested component (the Admin Panel).
  return children;
}