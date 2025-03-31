import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import QRGenerator from "../Attendance/QRGenerator";
import QRScanner from "../Attendance/QRScanner";
import {
  formatTime,
  formatDate,
  calculateTimeDifference,
} from "../../utils/helpers";
import {
  getTodayStatus,
  checkIn,
  checkOut,
} from "../../services/attendance.service";
import { getCurrentUser } from "../../services/auth.service";

const UserDashboard = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("status"); // Options: status, qrGenerator, qrScanner
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTodayStatus();
      setTodayStatus(data);
    } catch (err) {
      console.error("Error fetching today's status:", err);
      setError("Failed to fetch today's attendance status");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    setError("");
    try {
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      const data = await checkIn({
        location: JSON.stringify(coords),
      });

      // Update status with the new check-in
      setTodayStatus(data);
    } catch (err) {
      console.error("Check-in error:", err);
      setError(err.response?.data?.detail || "Failed to check in");
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutLoading(true);
    setError("");
    try {
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      const data = await checkOut({
        location: JSON.stringify(coords),
      });

      // Update status with the new check-out
      setTodayStatus(data);
    } catch (err) {
      console.error("Check-out error:", err);
      setError(err.response?.data?.detail || "Failed to check out");
    } finally {
      setCheckOutLoading(false);
    }
  };

  const getStatusLabel = () => {
    if (!todayStatus) return "Not Available";
    if (todayStatus.status === "present" && todayStatus.check_out_time)
      return "Present (Completed)";
    if (todayStatus.status === "present") return "Present (Working)";
    if (todayStatus.status === "late") return "Late";
    if (todayStatus.status === "half_day") return "Half Day";
    if (todayStatus.status === "absent") return "Absent";
    return "Not Available";
  };

  const getStatusColor = () => {
    if (!todayStatus) return "default";
    switch (todayStatus.status) {
      case "present":
        return "success";
      case "late":
        return "warning";
      case "half_day":
        return "info";
      case "absent":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h5">User Dashboard</Typography>
            <Box>
              <Button
                variant={activeTab === "status" ? "contained" : "outlined"}
                onClick={() => setActiveTab("status")}
                sx={{ mr: 1 }}
              >
                Status
              </Button>
              <Button
                variant={activeTab === "qrGenerator" ? "contained" : "outlined"}
                onClick={() => setActiveTab("qrGenerator")}
                sx={{ mr: 1 }}
              >
                Generate QR
              </Button>
              <Button
                variant={activeTab === "qrScanner" ? "contained" : "outlined"}
                onClick={() => setActiveTab("qrScanner")}
              >
                Scan QR
              </Button>
            </Box>
          </Paper>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </Grid>
        )}

        {activeTab === "status" && (
          <>
            {/* Welcome Card */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Welcome,{" "}
                    {currentUser?.name || currentUser?.username || "User"}!
                  </Typography>
                  <Typography variant="body1">
                    Today is {formatDate(new Date())}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Today's Status */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Today's Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {loading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                      <Chip
                        label={getStatusLabel()}
                        color={getStatusColor()}
                        sx={{ mr: 2 }}
                      />
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={fetchTodayStatus}
                        size="small"
                      >
                        Refresh
                      </Button>
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Check-in Time
                        </Typography>
                        <Typography variant="body1">
                          {todayStatus?.check_in_time
                            ? formatTime(todayStatus.check_in_time)
                            : "Not checked in"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Check-out Time
                        </Typography>
                        <Typography variant="body1">
                          {todayStatus?.check_out_time
                            ? formatTime(todayStatus.check_out_time)
                            : "Not checked out"}
                        </Typography>
                      </Grid>
                      {todayStatus?.check_in_time &&
                        todayStatus?.check_out_time && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="textSecondary">
                              Total Hours
                            </Typography>
                            <Typography variant="body1">
                              {calculateTimeDifference(
                                todayStatus.check_in_time,
                                todayStatus.check_out_time
                              )}
                            </Typography>
                          </Grid>
                        )}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<AccessTimeIcon />}
                      onClick={handleCheckIn}
                      disabled={
                        checkInLoading ||
                        (todayStatus && todayStatus.check_in_time !== null)
                      }
                    >
                      {checkInLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Check In"
                      )}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<CheckCircleIcon />}
                      onClick={handleCheckOut}
                      disabled={
                        checkOutLoading ||
                        (todayStatus && todayStatus.check_out_time !== null) ||
                        (todayStatus && todayStatus.check_in_time === null)
                      }
                    >
                      {checkOutLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Check Out"
                      )}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="info" icon={<LocationOnIcon />}>
                      Location data will be recorded when checking in or out.
                    </Alert>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </>
        )}

        {activeTab === "qrGenerator" && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Generate QR Code
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <QRGenerator />
            </Paper>
          </Grid>
        )}

        {activeTab === "qrScanner" && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Scan QR Code
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <QRScanner />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default UserDashboard;
