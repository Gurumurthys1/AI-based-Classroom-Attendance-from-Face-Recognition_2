// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  STUDENTS: '/api/students',
  ATTENDANCE: '/api/attendance',
  MARK_ATTENDANCE: '/api/attendance/mark',
  ATTENDANCE_STATS: '/api/attendance/stats'
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
