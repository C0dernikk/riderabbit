import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Allow Axios to automatically set the Content-Type and boundary for multipart forms
    if (config.data instanceof FormData) {
      if (config.headers && typeof config.headers.delete === 'function') {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("AXIOS RESPONSE ERROR:", error);
    let message = "Something went wrong";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    // Handle specific status codes
    if (error.response?.status === 401) {
      // Clear local storage or redirect to login if necessary
      // For now, just let the component handle it
    }

    return Promise.reject(new Error(message));
  },
);

export default api;
