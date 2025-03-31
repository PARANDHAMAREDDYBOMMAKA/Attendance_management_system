import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Html5QrcodeScanner } from "html5-qrcode";
import LocationTracker from "./LocationTracker";
import FaceCapture from "./FaceCapture";
import {
  checkIn,
  checkOut,
  getTodayStatus,
} from "../../services/attendance.service";

const QRScanner = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [qrResult, setQrResult] = useState("");
  const [location, setLocation] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [todayRecord, setTodayRecord] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(true);

  useEffect(() => {
    const fetchTodayStatus = async () => {
      try {
        const status = await getTodayStatus();
        setTodayRecord(status);
        if (status && status.check_in_time && !status.check_out_time) {
          setIsCheckingIn(false);
        }
      } catch (err) {
        console.error("Error fetching today status:", err);
      }
    };

    fetchTodayStatus();
  }, []);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        setQrResult(decodedText);
        setActiveStep(1);
        scanner.clear();
      },
      (error) => console.error("Scan Error:", error)
    );

    return () => {
      try {
        scanner.clear();
      } catch (error) {
        console.error("Error clearing scanner:", error);
      }
    };
  }, []);

  const resetForm = () => {
    setActiveStep(0);
    setQrResult("");
    setLocation(null);
    setFaceImage(null);
    setError("");
    setSuccess("");
  };

  const handleLocationData = (locationData) => {
    setLocation(locationData);
    setActiveStep(2);
  };

  const handleFaceCapture = (image, isConfirmed = false) => {
    setFaceImage(image);
    if (isConfirmed) {
      setActiveStep(3);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!qrResult) {
        throw new Error("QR code is required");
      }

      if (!location) {
        throw new Error("Location is required");
      }

      if (!faceImage) {
        throw new Error("Face verification is required");
      }

      // Format the data properly for the API
      const attendanceData = {
        qr_code: qrResult,
        location: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || 0,
          source: location.source || "manual",
        }),
        // Ensure face_image is properly formatted - remove the data URL prefix
        face_image: faceImage.includes("base64,")
          ? faceImage.split("base64,")[1]
          : faceImage,
      };

      console.log("Submitting attendance data:", attendanceData);

      let response;
      if (isCheckingIn) {
        response = await checkIn(attendanceData);
        setSuccess("Check-in successful!");
      } else {
        response = await checkOut(attendanceData);
        setSuccess("Check-out successful!");
      }

      setTodayRecord(response);
      setIsCheckingIn(!isCheckingIn);

      // Reset to initial step after successful submission
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Failed to submit attendance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    "Scan QR Code",
    "Verify Location",
    "Face Verification",
    "Confirmation",
  ];

  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12} md={10} lg={8}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" align="center" gutterBottom>
            {isCheckingIn ? "Check In" : "Check Out"}
          </Typography>

          {todayRecord && (
            <Card sx={{ mb: 3, backgroundColor: "background.default" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Attendance Status
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body1">
                    Check-in:{" "}
                    {todayRecord.check_in_time
                      ? new Date(todayRecord.check_in_time).toLocaleTimeString()
                      : "Not checked in yet"}
                  </Typography>
                  <Typography variant="body1">
                    Check-out:{" "}
                    {todayRecord.check_out_time
                      ? new Date(
                          todayRecord.check_out_time
                        ).toLocaleTimeString()
                      : "Not checked out yet"}
                  </Typography>
                  {todayRecord.check_in_time && todayRecord.check_out_time && (
                    <Typography variant="body1">
                      Duration:{" "}
                      {calculateTimeDifference(
                        todayRecord.check_in_time,
                        todayRecord.check_out_time
                      )}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {activeStep === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 400, mb: 2 }}>
                <div id="reader"></div>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, textAlign: "center" }}
              >
                Point your camera at the QR code to{" "}
                {isCheckingIn ? "check in" : "check out"}
              </Typography>
            </Box>
          )}

          {activeStep === 1 && (
            <LocationTracker onLocationCaptured={handleLocationData} />
          )}

          {activeStep === 2 && <FaceCapture onCapture={handleFaceCapture} />}

          {activeStep === 3 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                my: 3,
              }}
            >
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Ready to Submit
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
                QR code, location, and face verification complete. Please
                confirm to {isCheckingIn ? "check in" : "check out"}.
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="outlined" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : isCheckingIn ? (
                    "Check In"
                  ) : (
                    "Check Out"
                  )}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

const calculateTimeDifference = (startTime, endTime) => {
  if (!startTime || !endTime) return "-";

  const start = new Date(startTime);
  const end = new Date(endTime);

  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

export default QRScanner;
