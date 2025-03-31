import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "./App.css";

// Components
import Login from "./components/Auth/Login";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import UserDashboard from "./components/Dashboard/UserDashboard";
import AttendanceLogs from "./components/Attendance/AttendanceLogs";
import QRGenerator from "./components/Attendance/QRGenerator";
import QRScanner from "./components/Attendance/QRScanner";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { isAuthenticated, isAdmin } from "./services/auth.service";

// Create theme with light/dark mode support
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      lighter: "#e3f2fd",
    },
    secondary: {
      main: "#dc004e",
    },
    success: {
      main: "#4caf50",
    },
    warning: {
      main: "#ff9800",
    },
    error: {
      main: "#f44336",
    },
    info: {
      main: "#2196f3",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated() ? (
                <Navigate
                  to={isAdmin() ? "/admin-dashboard" : "/user-dashboard"}
                />
              ) : (
                <Login />
              )
            }
          />

          {/* Protected Routes for regular users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/user/scan-qr" element={<QRScanner />} />
            <Route path="/user/my-attendance" element={<AttendanceLogs />} />
          </Route>

          {/* Admin-only Routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/generate-qr" element={<QRGenerator />} />
            <Route path="/admin/users" element={<UserDashboard />} />
            <Route path="/admin/reports" element={<AdminDashboard />} />
            <Route path="/admin/attendance-logs" element={<AttendanceLogs />} />
          </Route>

          {/* Default Route */}
          <Route
            path="/"
            element={
              isAuthenticated() ? (
                <Navigate
                  to={isAdmin() ? "/admin-dashboard" : "/user-dashboard"}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Catch-all route for undefined paths */}
          <Route
            path="*"
            element={
              isAuthenticated() ? (
                <Navigate
                  to={isAdmin() ? "/admin-dashboard" : "/user-dashboard"}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
