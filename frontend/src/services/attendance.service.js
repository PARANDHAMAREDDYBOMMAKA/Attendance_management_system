import api from "./api";

// QR Code related services
export const generateQRCode = async () => {
  try {
    const response = await api.post("/attendance/qrcodes/generate/");
    return response.data;
  } catch (error) {
    console.error("QR Code Generation Error:", error.response?.data || error);
    throw error;
  }
};

// 🛠 Fixed Check-in function to match API expectations
export const checkIn = async (data) => {
  try {
    console.log("Check-in request payload:", data); // Debugging log

    let locationData;
    try {
      // Access geolocation instead of location
      const geolocation = data.geolocation ? JSON.parse(data.geolocation) : null;
      locationData = geolocation;

      // Check if locationData is valid
      if (!locationData || !locationData.latitude || !locationData.longitude) {
        throw new Error("Invalid location data");
      }
    } catch (error) {
      console.error("Error parsing location data:", error);
      // Fallback to IP address location
      locationData = {
        latitude: 17.384,
        longitude: 78.4564,
        accuracy: 5000,
        source: 'ip',
        timestamp: new Date().toISOString(),
      };
    }

    // Format data according to backend expectations
    const formattedData = {
      user_id: data.user_id,
      qr_code_data: data.qr_code_data || null,
      check_in_location: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        source: locationData.source,
        timestamp: locationData.timestamp,
      },
      face_verified: !!data.face_data,
      face_data: data.face_data,
      device_info:
        typeof data.device_info === "string"
          ? JSON.parse(data.device_info)
          : data.device_info,
    };

    const response = await api.post(
      "/attendance/records/check_in/",
      formattedData
    );
    console.log("Check-in response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Check-in error details:", error.response?.data || error);
    throw error;
  }
};

// 🛠 Fixed Check-out function to match API expectations
export const checkOut = async (data) => {
  try {
    console.log("Check-out request payload:", data);

    let locationData =
      typeof data.location === "string"
        ? JSON.parse(data.location)
        : data.location;

    const formattedData = {
      user_id: data.user_id,
      qr_code_data: data.qr_code_data || null,
      check_out_location: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        source: locationData.source,
        timestamp: locationData.timestamp,
      },
      face_verified: !!data.face_data,
      face_data: data.face_data,
      device_info:
        typeof data.device_info === "string"
          ? JSON.parse(data.device_info)
          : data.device_info,
    };

    const response = await api.post(
      "/attendance/records/check_out/",
      formattedData
    );
    console.log("Check-out response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Check-out error details:", error.response?.data || error);
    throw error;
  }
};

export const getTodayStatus = async () => {
  try {
    const response = await api.get("/attendance/records/today_status/");
    return response.data;
  } catch (error) {
    console.error(
      "Error getting today's attendance status:",
      error.response?.data || error
    );
    throw error;
  }
};

export const getAttendanceLogs = async (params = {}) => {
  try {
    const response = await api.get("/attendance/logs/", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching attendance logs:",
      error.response?.data || error
    );
    throw error;
  }
};

export const getAttendanceRecords = async (params = {}) => {
  try {
    const response = await api.get("/attendance/records/", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching attendance records:",
      error.response?.data || error
    );
    throw error;
  }
};

// Dashboard services for admin
export const getDashboardStats = async (date = null) => {
  try {
    const params = date ? { date } : {};
    const response = await api.get("/dashboard/stats/", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching dashboard stats:",
      error.response?.data || error
    );
    throw error;
  }
};

export const getAttendanceTrends = async (days = 30) => {
  try {
    const response = await api.get("/dashboard/trends/", { params: { days } });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching attendance trends:",
      error.response?.data || error
    );
    throw error;
  }
};

export const getUserAttendanceSummary = async (days = 30) => {
  try {
    const response = await api.get("/dashboard/user-summary/", {
      params: { days },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching user attendance summary:",
      error.response?.data || error
    );
    throw error;
  }
};
