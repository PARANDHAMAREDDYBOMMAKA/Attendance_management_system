// Date and time formatting helpers
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const formatTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Calculate time difference in hours and minutes
export const calculateTimeDifference = (startTime, endTime) => {
  if (!startTime || !endTime) return "-";

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Calculate difference in milliseconds
  const diffMs = end - start;

  // Convert to hours and minutes
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

// Format attendance status with proper capitalization
export const formatStatus = (status) => {
  if (!status) return "-";

  // Convert underscores to spaces and capitalize first letter of each word
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Convert base64 to file
export const base64ToFile = (base64String, filename, mimeType) => {
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mimeType || mime });
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Get color based on attendance status
export const getStatusColor = (status) => {
  switch (status) {
    case "present":
      return "success.main";
    case "absent":
      return "error.main";
    case "late":
      return "warning.main";
    case "half_day":
      return "info.main";
    default:
      return "text.primary";
  }
};

// Format duration in minutes to hours and minutes
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return "-";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

// Check if a time is within work hours
export const isWorkingHours = (
  time,
  workStart = "09:00",
  workEnd = "17:00"
) => {
  if (!time) return false;

  const timeObj = new Date(time);
  const hours = timeObj.getHours();
  const minutes = timeObj.getMinutes();

  const [startHour, startMinute] = workStart.split(":").map(Number);
  const [endHour, endMinute] = workEnd.split(":").map(Number);

  const timeValue = hours * 60 + minutes;
  const startValue = startHour * 60 + startMinute;
  const endValue = endHour * 60 + endMinute;

  return timeValue >= startValue && timeValue <= endValue;
};

// Calculate attendance rate
export const calculateAttendanceRate = (present, total) => {
  if (!total || total === 0) return 0;
  return ((present / total) * 100).toFixed(1);
};

// Format GPS coordinates
export const formatGPSCoordinates = (coordinates) => {
  if (!coordinates) return "-";
  try {
    const { latitude, longitude } = JSON.parse(coordinates);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error("Error parsing GPS coordinates:", error);
    return "-";
  }
};

// Generate random color
export const generateRandomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};
