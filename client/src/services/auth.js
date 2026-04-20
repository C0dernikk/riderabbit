import api from "./api";

/**
 * Auth API services.
 * Fully aligned with backend authRoute.js
 */
export const authService = {
  // User Auth
  register: async (userData) => {
    return api.post("/auth/register", userData);
  },
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response?.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
    }
    return response;
  },
  google: async (userData) => {
    const response = await api.post("/auth/google", userData);
    if (response?.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
    }
    return response;
  },
  refreshToken: async () => {
    return api.post("/auth/refresh-token");
  },
  getCurrentUser: async () => {
    return api.get("/auth/me");
  },

  // Vendor Auth
  vendorSignup: async (userData) => {
    return api.post("/vendor/register", userData);
  },
  vendorLogin: async (credentials) => {
    const response = await api.post("/vendor/login", credentials);
    if (response?.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
    }
    return response;
  },
  vendorGoogle: async (userData) => {
    const response = await api.post("/vendor/google", userData);
    if (response?.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
    }
    return response;
  },
  vendorLogout: async () => {
    localStorage.removeItem("accessToken");
    return api.get("/vendor/logout");
  },

  // Admin Auth
  adminLogin: async (credentials) => {
    const response = await api.post("/admin/login", credentials);
    if (response?.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
    }
    return response;
  },
  adminLogout: async () => {
    localStorage.removeItem("accessToken");
    return api.get("/admin/logout");
  },
};
