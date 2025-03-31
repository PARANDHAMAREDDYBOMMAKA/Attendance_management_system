import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  Grid,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Webcam from "react-webcam";

const FaceCapture = ({ onCapture, onError }) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [image, setImage] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("user");

  const webcamRef = useRef(null);

  useEffect(() => {
    // Check if we have camera access
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setIsCameraReady(true);
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setCameraError(
          "Camera access denied. Please check your browser permissions."
        );
      });
  }, []);

  const capture = () => {
    setIsCapturing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImage(imageSrc);
        if (onCapture) {
          onCapture(imageSrc);
        }
      } else {
        throw new Error("Failed to capture image");
      }
    } catch (err) {
      console.error("Capture error:", err);
      setCameraError("Failed to capture image. Please try again.");
      if (onError) {
        onError(err);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const retake = () => {
    setImage(null);
  };

  const toggleCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
  };

  return (
    <Box>
      {cameraError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {cameraError}
        </Alert>
      )}

      {!isCameraReady ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Face Verification
              </Typography>

              {!image ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ width: "100%", maxWidth: 400, mb: 2 }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      onUserMediaError={(err) => {
                        console.error("Webcam error:", err);
                        setCameraError("Camera error: " + err.message);
                      }}
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FlipCameraAndroidIcon />}
                      onClick={toggleCamera}
                    >
                      Flip Camera
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={
                        isCapturing ? (
                          <CircularProgress size={20} />
                        ) : (
                          <CameraAltIcon />
                        )
                      }
                      onClick={capture}
                      disabled={isCapturing}
                    >
                      Capture
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Card sx={{ maxWidth: 400, mb: 2 }}>
                    <CardMedia
                      component="img"
                      image={image}
                      alt="Captured face"
                      sx={{ width: "100%", borderRadius: "8px" }}
                    />
                  </Card>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button variant="outlined" onClick={retake}>
                      Retake
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => {
                        if (onCapture) onCapture(image, true);
                      }}
                    >
                      Confirm
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default FaceCapture;
