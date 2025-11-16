import axios from "axios";

// Create a single axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080", // backend base URL
});

// ✅ Request Interceptor — add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Response Interceptor — handle 401 errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login"; // ✅ redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
