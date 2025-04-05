import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Changed from "/api/auth"

const api = axios.create({
    baseURL: API_URL
});



// Add a request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});
  
  // Add a response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem("user");
            localStorage.removeItem("auth-token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
  );

  // Change these lines in api.js
export const getNotifications = async () => {
    try {
        const res = await api.get('/notifications'); // Use the correct base URL
        return res.data;
    } catch (error) {
        console.error("❌ Fetch Notifications Error:", error.response ? error.response.data : error.message);
        throw error;
    }
  };
  
  export const getUnreadNotificationsCount = async () => {
    try {
        const res = await api.get('/notifications/unread-count');
        return res.data;
    } catch (error) {
        console.error("❌ Fetch Unread Count Error:", error.response ? error.response.data : error.message);
        throw error;
    }
  };
  
  export const markAllNotificationsAsRead = async () => {
    try {
        const res = await api.put('/notifications/read');
        return res.data;
    } catch (error) {
        console.error("❌ Mark Notifications Read Error:", error.response ? error.response.data : error.message);
        throw error;
    }
  };