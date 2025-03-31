import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../../services/auth.service';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { Box } from '@mui/material';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const auth = isAuthenticated();
  const admin = isAdmin();

  // Check if authenticated
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  // Check if admin access is required but user is not admin
  if (requireAdmin && !admin) {
    return <Navigate to="/user-dashboard" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: 30 } }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default ProtectedRoute;