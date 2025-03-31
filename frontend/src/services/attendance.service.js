import api from './api';

// QR Code related services
export const generateQRCode = async () => {
  try {
    const response = await api.post('/attendance/qrcodes/generate/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Attendance record services
export const checkIn = async (data) => {
  try {
    const response = await api.post('/attendance/records/check_in/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkOut = async (data) => {
  try {
    const response = await api.post('/attendance/records/check_out/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTodayStatus = async () => {
  try {
    const response = await api.get('/attendance/records/today_status/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAttendanceLogs = async (params = {}) => {
  try {
    const response = await api.get('/attendance/logs/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAttendanceRecords = async (params = {}) => {
  try {
    const response = await api.get('/attendance/records/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Dashboard services for admin
export const getDashboardStats = async (date = null) => {
  try {
    const params = date ? { date } : {};
    const response = await api.get('/dashboard/stats/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAttendanceTrends = async (days = 30) => {
  try {
    const response = await api.get('/dashboard/trends/', { params: { days } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserAttendanceSummary = async (days = 30) => {
  try {
    const response = await api.get('/dashboard/user-summary/', { params: { days } });
    return response.data;
  } catch (error) {
    throw error;
  }
};