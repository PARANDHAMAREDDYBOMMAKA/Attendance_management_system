import React, { useState, useEffect, useRef } from "react";
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
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
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

// Face capture component
const FaceCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError(
          "Could not access camera. Please ensure camera permissions are granted."
        );
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    // Get image data as base64
    const imageData = canvas.toDataURL("image/jpeg");

    // Pass the captured face data to parent
    onCapture(imageData);
  };

  return (
    <Box sx={{ textAlign: "center", p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Face Verification
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ position: "relative", width: "100%", mb: 2 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        />

        {!isCameraReady && !error && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="outlined" color="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCapture}
          disabled={!isCameraReady}
          startIcon={<CameraAltIcon />}
        >
          Capture
        </Button>
      </Box>
    </Box>
  );
};

// Improved Location tracker component
const LocationTracker = ({ onLocationCaptured, onCancel }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLoading(true);
    setError("");

    // Try IP-based location as fallback
    if (!navigator.geolocation) {
      try {
        const ipLocation = await getLocationFromIP();
        setLocation(ipLocation);
        setSource("ip");
        setLoading(false);
      } catch (err) {
        console.error("Location determination failed:", err);
        setError("Unable to determine your location.");
        setLoading(false);
      }
      return;
    }

    // Try to get GPS location
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            source: "gps",
          };
          setLocation(locationData);
          setSource("gps");
          setLoading(false);
        },
        async (err) => {
          console.warn("GPS location error, using IP fallback:", err);
          try {
            const ipLocation = await getLocationFromIP();
            setLocation(ipLocation);
            setSource("ip");
          } catch (ipErr) {
            setError(
              "Unable to determine your location. Please check your settings."
            );
          } finally {
            setLoading(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      console.error("Geolocation error:", err);
      setError("Error accessing location services.");
      setLoading(false);
    }
  };

  // Function to get location from IP
  const getLocationFromIP = async () => {
    // In a real app, you would call a geolocation API service
    // This is a simulated response
    return {
      latitude: 17.384,
      longitude: 78.4564,
      accuracy: 5000, // Higher number means less precise
      source: "ip",
    };
  };

  const handleContinue = () => {
    if (location) {
      onLocationCaptured(location);
    } else {
      setError("Location data is required to continue");
    }
  };

  return (
    <Box sx={{ textAlign: "center", py: 2 }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            my: 4,
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1">Detecting your location...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button
            variant="text"
            color="inherit"
            sx={{ mt: 1 }}
            onClick={getLocation}
          >
            Try Again
          </Button>
        </Alert>
      ) : location ? (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              justifyContent: "center",
            }}
          >
            <LocationOnIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Location Detected</Typography>
          </Box>

          <Card sx={{ mb: 3, mx: "auto", maxWidth: 400 }}>
            <CardContent>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "medium", mb: 2 }}
              >
                {source === "gps" ? "GPS Location" : "Approximate IP Location"}
              </Typography>

              <Box
                sx={{
                  bgcolor: "rgba(0,0,0,0.02)",
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Latitude: {location.latitude.toFixed(6)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Longitude: {location.longitude.toFixed(6)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Accuracy: ~{Math.round(location.accuracy)} meters
                </Typography>
              </Box>

              {source === "ip" && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Using IP-based location since precise GPS location is
                  unavailable.
                </Alert>
              )}
            </CardContent>
          </Card>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This location will be recorded with your attendance
          </Typography>
        </>
      ) : (
        <Typography variant="body1" sx={{ my: 3 }}>
          Unable to determine location
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleContinue}
          disabled={loading || !location}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

const UserDashboard = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const currentUser = getCurrentUser();

  // State for attendance process
  const [attendanceProcess, setAttendanceProcess] = useState({
    isActive: false,
    step: null, // 'location', 'face', 'processing'
    actionType: null, // 'checkIn' or 'checkOut'
    location: null,
    faceData: null,
  });

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

  const startAttendanceProcess = (actionType) => {
    setAttendanceProcess({
      isActive: true,
      step: "location",
      actionType: actionType,
      location: null,
      faceData: null,
    });
  };

  const handleLocationCaptured = (locationData) => {
    setAttendanceProcess((prev) => ({
      ...prev,
      location: locationData,
      step: "face",
    }));
  };

  const handleFaceCaptured = async (faceData) => {
    setAttendanceProcess((prev) => ({
      ...prev,
      faceData: faceData,
      step: "processing",
    }));

    // Process the attendance with both location and face data
    await processAttendance(attendanceProcess.location, faceData);
  };

const processAttendance = async (locationData, faceData) => {
    // Debugging log to check location data
    console.log("Location Data:", locationData);
    try {
      if (attendanceProcess.actionType === "checkIn") {
        await processCheckIn(locationData, faceData);
      } else {
        await processCheckOut(locationData, faceData);
      }

      // Reset the process
      setAttendanceProcess({
        isActive: false,
        step: null,
        actionType: null,
        location: null,
        faceData: null,
      });
    } catch (error) {
      setError(`Failed to process attendance: ${error.message}`);
      // Reset to last step on error
      setAttendanceProcess((prev) => ({
        ...prev,
        step: prev.step === "processing" ? "face" : prev.step,
      }));
    }
  };

  const cancelAttendanceProcess = () => {
    setAttendanceProcess({
      isActive: false,
      step: null,
      actionType: null,
      location: null,
      faceData: null,
    });
  };

  const processCheckIn = async (locationData, faceData) => {
    setCheckInLoading(true);
    setError("");
    try {
      // Ensure qr_code_data and geolocation are included in the payload
      const payload = {
        qr_code_data: attendanceProcess.qrCodeData, // Add QR code data
        geolocation: JSON.stringify({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          source: locationData.source,
          timestamp: new Date().toISOString(),
        }),
        face_data: faceData, // Face data for verification
        device_info: JSON.stringify({
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          appVersion: "1.0.0",
        }),
      };

      const data = await checkIn(payload);
      setTodayStatus(data);
    } catch (err) {
      console.error("Check-in error:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to check in. Please try again.";
      setError(errorMsg);
      throw err;
    } finally {
      setCheckInLoading(false);
    }
  };

  const processCheckOut = async (locationData, faceData) => {
    setCheckOutLoading(true);
    setError("");
    try {
      // Ensure qr_code_data and geolocation are included in the payload
      const payload = {
        qr_code_data: attendanceProcess.qrCodeData, // Add QR code data
        geolocation: JSON.stringify({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          source: locationData.source,
          timestamp: new Date().toISOString(),
        }),
        face_data: faceData, // Face data for verification
        device_info: JSON.stringify({
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          appVersion: "1.0.0",
        }),
      };

      const data = await checkOut(payload);
      setTodayStatus(data);
    } catch (err) {
      console.error("Check-out error:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to check out. Please try again.";
      setError(errorMsg);
      throw err;
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
    <Box sx={{ flexGrow: 1, width: "100%", p: 3 }}>
      <Grid container spacing={3} sx={{ width: "100%" }}>
        {/* Header */}
        <Grid item xs={12} sx={{ width: "100%" }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
              background: "linear-gradient(to right, #3a7bd5, #3a6073)",
              color: "white",
              width: "100%",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Attendance Dashboard
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchTodayStatus}
              startIcon={<RefreshIcon />}
              sx={{
                bgcolor: "white",
                color: "#3a6073",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.9)",
                },
              }}
            >
              Refresh
            </Button>
          </Paper>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          </Grid>
        )}

        {/* Welcome Card */}
        <Grid item xs={12}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(to right, #f5f7fa, #c3cfe2)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Welcome, {currentUser?.name || currentUser?.username || "User"}!
              </Typography>
              <Typography variant="body1" sx={{ color: "#555" }}>
                Today is {formatDate(new Date())}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Status */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Today's Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
                  <Chip
                    label={getStatusLabel()}
                    color={getStatusColor()}
                    sx={{
                      mr: 2,
                      fontSize: "1rem",
                      py: 1,
                      fontWeight: "bold",
                    }}
                  />
                </Box>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Card
                      sx={{ p: 2, bgcolor: "rgba(0,0,0,0.02)", height: "100%" }}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        Check-in Time
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
                        {todayStatus?.check_in_time
                          ? formatTime(todayStatus.check_in_time)
                          : "Not checked in"}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card
                      sx={{ p: 2, bgcolor: "rgba(0,0,0,0.02)", height: "100%" }}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        Check-out Time
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <CheckCircleIcon
                          sx={{ mr: 1, color: "secondary.main" }}
                        />
                        {todayStatus?.check_out_time
                          ? formatTime(todayStatus.check_out_time)
                          : "Not checked out"}
                      </Typography>
                    </Card>
                  </Grid>
                  {todayStatus?.check_in_time &&
                    todayStatus?.check_out_time && (
                      <Grid item xs={12}>
                        <Card sx={{ p: 2, bgcolor: "rgba(0,0,0,0.02)" }}>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mb: 1, fontWeight: "bold" }}
                          >
                            Total Hours
                          </Typography>
                          <Typography variant="h6">
                            {calculateTimeDifference(
                              todayStatus.check_in_time,
                              todayStatus.check_out_time
                            )}
                          </Typography>
                        </Card>
                      </Grid>
                    )}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
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
                  onClick={() => startAttendanceProcess("checkIn")}
                  disabled={
                    checkInLoading ||
                    (todayStatus?.check_in_time && !todayStatus?.check_out_time)
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow:
                      "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
                    "&:hover": {
                      boxShadow:
                        "0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
                    },
                  }}
                >
                  {checkInLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Check In"
                  )}
                </Button>
                {todayStatus?.check_in_time && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    Last check-in: {formatTime(todayStatus.check_in_time)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={() => startAttendanceProcess("checkOut")}
                  disabled={
                    checkOutLoading ||
                    !todayStatus?.check_in_time ||
                    todayStatus?.check_out_time
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow:
                      "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
                    "&:hover": {
                      boxShadow:
                        "0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
                    },
                  }}
                >
                  {checkOutLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Check Out"
                  )}
                </Button>
                {todayStatus?.check_out_time && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    Last check-out: {formatTime(todayStatus.check_out_time)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Alert
                  severity="info"
                  icon={<LocationOnIcon />}
                  sx={{ borderRadius: 2, mt: 2 }}
                >
                  The attendance process will capture your location and verify
                  your identity with face recognition.
                </Alert>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Attendance Process Dialog */}
      <Dialog
        open={attendanceProcess.isActive}
        onClose={cancelAttendanceProcess}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {attendanceProcess.actionType === "checkIn"
              ? "Check In"
              : "Check Out"}{" "}
            Process
          </Typography>
          <IconButton onClick={cancelAttendanceProcess}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* Location Step */}
          {attendanceProcess.step === "location" && (
            <LocationTracker
              onLocationCaptured={handleLocationCaptured}
              onCancel={cancelAttendanceProcess}
            />
          )}

          {/* Face Capture Step */}
          {attendanceProcess.step === "face" && (
            <FaceCapture
              onCapture={handleFaceCaptured}
              onCancel={() =>
                setAttendanceProcess((prev) => ({
                  ...prev,
                  step: "location",
                }))
              }
            />
          )}

          {/* Processing Step */}
          {attendanceProcess.step === "processing" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 4,
              }}
            >
              <CircularProgress sx={{ mb: 3 }} />
              <Typography variant="h6">
                Processing your attendance...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please wait while we verify your identity and location
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;
