import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { generateQRCode } from '../../services/attendance.service';

const QRGenerator = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchQRCode = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await generateQRCode();
      setQrData(data);
      
      // Calculate time left in seconds
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      const secondsLeft = Math.floor((expiresAt - now) / 1000);
      setTimeLeft(secondsLeft);
    } catch (err) {
      setError('Failed to generate QR code. Please try again.');
      console.error('QR code generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Format time left as minutes:seconds
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          QR Code Generator
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph align="center">
          Generate a QR code for attendance check-in/check-out
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : qrData ? (
          <Card sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CardMedia
                component="img"
                image={qrData.qr_image}
                alt="QR Code"
                sx={{ width: 250, height: 250 }}
              />
            </Box>
            <CardContent sx={{ textAlign: 'center' }}>
              {timeLeft > 0 ? (
                <>
                  <Chip 
                    label={`Expires in ${formatTimeLeft()}`} 
                    color="primary" 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Code: {qrData.code.substring(0, 8)}...
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="error">
                  QR Code has expired
                </Typography>
              )}
            </CardContent>
          </Card>
        ) : null}

        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchQRCode}
          fullWidth
          disabled={loading}
        >
          Generate New QR Code
        </Button>
      </Paper>
    </Box>
  );
};

export default QRGenerator;