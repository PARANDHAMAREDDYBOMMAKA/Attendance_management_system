import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import QRCode from "react-qr-code";
import { generateQRCode } from "../../services/attendance.service";

const QRGenerator = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expiryTimer, setExpiryTimer] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await generateQRCode();
      setQrData(response);

      if (response.expiry_time) {
        const expiryTime = new Date(response.expiry_time).getTime();
        const currentTime = new Date().getTime();
        const timeLeft = Math.max(
          0,
          Math.floor((expiryTime - currentTime) / 1000)
        );

        setExpiryTimer(timeLeft);

        const interval = setInterval(() => {
          setExpiryTimer((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);

        // This return won't work here since we're not in a useEffect
        // Should be handled in a separate useEffect
      }
    } catch (err) {
      setError("Failed to generate QR code. Please try again.");
      console.error("QR Code generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add a useEffect to handle the timer cleanup
  useEffect(() => {
    let interval;

    if (qrData?.expiry_time && expiryTimer > 0) {
      interval = setInterval(() => {
        setExpiryTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrData, expiryTimer]);

  const formatTime = (seconds) => {
    if (seconds === null) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12} md={8} lg={6}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Generate Attendance QR Code
          </Typography>

          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}

          {qrData ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                my: 3,
              }}
            >
              <Box
                sx={{
                  p: 3,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  mb: 2,
                }}
              >
                <QRCode
                  value={qrData.code}
                  size={200}
                  level="H"
                  // Fix: Changed from includeMargin to includemargin
                  includemargin={true}
                />
              </Box>
              <Typography variant="body1" gutterBottom>
                Code: {qrData.code}
              </Typography>
              <Typography
                variant="body1"
                color={expiryTimer < 30 ? "error" : "text.secondary"}
              >
                Expires in: {formatTime(expiryTimer)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerate}
                sx={{ mt: 2 }}
              >
                Generate New QR
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Generate QR Code"}
            </Button>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default QRGenerator;
