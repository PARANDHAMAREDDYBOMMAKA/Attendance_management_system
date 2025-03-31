import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Function to get location from IP (simulated for now)
const getLocationFromIP = async () => {
  try {
    // In a real app, this would be an API call to a geolocation service
    // For now, returning a mock response
    return {
      latitude: 17.384,
      longitude: 78.4564,
      accuracy: 5000, // High accuracy value indicates lower precision
      source: "ip",
    };
  } catch (error) {
    console.error("Error fetching IP location:", error);
    throw error;
  }
};

const LocationTracker = ({ onLocationCaptured }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usingGPS, setUsingGPS] = useState(true);

  // Try to get GPS location first
  useEffect(() => {
    if (usingGPS) {
      getGPSLocation();
    }
  }, [usingGPS]);

  const getGPSLocation = () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      setUsingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: "gps",
        };

        setLocation(locationData);
        setLoading(false);
      },
      (err) => {
        console.error("Error getting location:", err);
        setError(
          `Unable to retrieve your location: ${err.message}. Using IP-based location instead.`
        );
        setLoading(false);
        setUsingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Fallback to IP-based location if GPS fails
  useEffect(() => {
    const fetchIPLocation = async () => {
      if (!usingGPS && !location) {
        try {
          setLoading(true);
          setError("");
          const ipLocation = await getLocationFromIP();
          setLocation(ipLocation);
        } catch (err) {
          setError("Failed to get location. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchIPLocation();
  }, [usingGPS, location]);

  const handleContinue = () => {
    if (location) {
      onLocationCaptured(location);
    } else {
      setError("Location data is required to continue");
    }
  };

  const handleRetry = () => {
    setLocation(null);
    setUsingGPS(true);
    getGPSLocation();
  };

  return (
    <Box sx={{ textAlign: "center", py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Location Verification
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : location ? (
        <Card sx={{ mb: 3, mx: "auto", maxWidth: 400 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LocationOnIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Location {location.source === "gps" ? "(GPS)" : "(IP-based)"}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Latitude: {location.latitude}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Longitude: {location.longitude}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Accuracy: {Math.round(location.accuracy)} meters
            </Typography>

            {location.source === "ip" && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Using approximate location. GPS is more accurate.
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1" sx={{ my: 3 }}>
          Getting your current location...
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        {location && location.source === "ip" && (
          <Button
            startIcon={<MyLocationIcon />}
            variant="outlined"
            onClick={handleRetry}
          >
            Try GPS Instead
          </Button>
        )}
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

export default LocationTracker;
