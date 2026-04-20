import api from "./api";

/**
 * User profile and management services.
 */
export const userService = {
  updateProfile: async (id, userData) => {
    return api.put(`/user/profile/${id}`, userData);
  },
  editProfile: async (id, formData) => {
    return api.put(`/user/profile/edit/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteAccount: async (id) => {
    return api.delete(`/user/profile/${id}`);
  },
  signOut: async () => {
    localStorage.removeItem("accessToken");
    return api.get("/user/logout");
  },

  // Notifications
  getNotifications: async () => {
    return api.get("/user/notifications");
  },
  markAllRead: async () => {
    return api.patch("/user/notifications/read-all");
  },
  markRead: async (notificationId) => {
    return api.patch(`/user/notifications/${notificationId}/read`);
  },

  // Admin User Management
  adminGetAllUsers: async () => {
    return api.get("/admin/allUsers");
  },
  adminGetAllVendors: async () => {
    return api.get("/admin/allVendors");
  },
  adminDeleteUser: async (userId) => {
    return api.delete(`/admin/deleteUser/${userId}`);
  },
};
