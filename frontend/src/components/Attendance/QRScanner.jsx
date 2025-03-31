import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Webcam from "react-webcam";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

import {
  checkIn,
  checkOut,
  getTodayStatus,
} from "../../services/attendance.service";
import LocationTracker from "./LocationTracker";

const QRScanner = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [location, setLocation] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const webcamRef = useRef(null);
  const html5QrCode = useRef(null);
  const qrScannerRef = useRef(null);

  // Get current attendance status
  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      try {
        const status = await getTodayStatus();
        setAttendanceStatus(status);

        // Determine if user is checking in or out
        if (status.status === "absent" || !status.check_in_time) {
          setIsCheckingIn(true);
        } else if (status.check_in_time && !status.check_out_time) {
          setIsCheckingIn(false);
        } else {
          // Already checked in and out
          setIsCheckingIn(false);
        }
      } catch (err) {
        console.error("Error fetching attendance status:", err);
        setError("Failed to fetch your attendance status");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceStatus();
  }, []);

  // Initialize QR scanner
  const startQRScanner = () => {
    if (!qrScannerRef.current) return;

    if (html5QrCode.current) {
      html5QrCode.current.stop();
    }

    html5QrCode.current = new Html5Qrcode(qrScannerRef.current.id);

    html5QrCode.current
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR Code scanned successfully
          setScanResult(decodedText);
          html5QrCode.current.stop();
          setIsCameraOpen(true); // Open webcam for face capture after QR scan
        },
        (errorMessage) => {
          // QR scan continues until success, no need to handle errors
          console.log(errorMessage);
        }
      )
      .catch((err) => {
        setError(`QR scanner initialization failed: ${err}`);
      });
  };

  const handleStartScan = () => {
    setError("");
    setSuccess("");
    setScanResult("");
    qrScannerRef.current = document.getElementById("qr-reader");
    startQRScanner();
  };

  const captureImage = () => {
    if (!webcamRef.current) return null;
    return webcamRef.current.getScreenshot();
  };

  const handleSubmitAttendance = async () => {
    if (!scanResult || !location) {
      setError("QR code and location are required");
      return;
    }

    const faceImage = captureImage();
    if (!faceImage) {
      setError("Failed to capture face image");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const data = {
        qr_code_data: scanResult,
        geolocation: JSON.stringify(location),
        face_image: faceImage,
      };

      if (isCheckingIn) {
        await checkIn(data);
        setSuccess("Successfully checked in!");
      } else {
        await checkOut(data);
        setSuccess("Successfully checked out!");
      }

      // Reset state after successful submission
      setScanResult("");
      setIsCameraOpen(false);

      // Refresh attendance status
      const status = await getTodayStatus();
      setAttendanceStatus(status);

      // Update check-in/out status
      if (status.check_in_time && !status.check_out_time) {
        setIsCheckingIn(false);
      }
    } catch (err) {
      console.error("Attendance submission error:", err);
      setError(err.response?.data?.detail || "Failed to submit attendance");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
    setScanResult("");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          {isCheckingIn ? "Check In" : "Check Out"}
        </Typography>

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

        {attendanceStatus && (
          <Box
            sx={{ mb: 3, p: 2, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <Typography variant="body1" gutterBottom>
              <strong>Today's Status:</strong>{" "}
              {attendanceStatus.status.toUpperCase()}
            </Typography>
            {attendanceStatus.check_in_time && (
              <Typography variant="body2">
                Check In:{" "}
                {new Date(attendanceStatus.check_in_time).toLocaleTimeString()}
              </Typography>
            )}
            {attendanceStatus.check_out_time && (
              <Typography variant="body2">
                Check Out:{" "}
                {new Date(attendanceStatus.check_out_time).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        )}

        {/* Check if user has already completed attendance for today */}
        {attendanceStatus &&
        attendanceStatus.check_in_time &&
        attendanceStatus.check_out_time ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            You have already completed your attendance for today.
          </Alert>
        ) : (
          <>
            {!scanResult && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" paragraph>
                  Scan the QR code provided by your administrator to{" "}
                  {isCheckingIn ? "check in" : "check out"}.
                </Typography>
                <div
                  id="qr-reader"
                  ref={qrScannerRef}
                  style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
                ></div>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<QrCodeScannerIcon />}
                    onClick={handleStartScan}
                  >
                    Start Scanning
                  </Button>
                </Box>
              </Box>
            )}

            {/* Location tracker (hidden but active) */}
            <Box sx={{ display: "none" }}>
              <LocationTracker setLocation={setLocation} />
            </Box>

            {scanResult && isCameraOpen && (
              <Dialog open={isCameraOpen} onClose={handleCloseCamera}>
                <DialogTitle>Capture Face Image</DialogTitle>
                <DialogContent>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    style={{ width: "100%" }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseCamera} color="secondary">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAttendance}
                    color="primary"
                    variant="contained"
                    disabled={isProcessing}
                    startIcon={
                      isProcessing ? (
                        <CircularProgress size={20} />
                      ) : (
                        <CameraAltIcon />
                      )
                    }
                  >
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default QRScanner;
