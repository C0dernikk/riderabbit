import api from "./api";

export const adminService = {
  getDashboardStats: async () => {
    return api.get("/admin/dashboard/stats");
  },
  checkSystemHealth: async () => {
    return api.get("/admin/health");
  },
  getAllUsers: async () => {
    return api.get("/admin/allUsers");
  },
  getAllVendors: async () => {
    return api.get("/admin/allVendors");
  },
  deleteUser: async (userId) => {
    return api.delete(`/admin/deleteUser/${userId}`);
  },
  getVendorRequests: async () => {
    return api.get("/admin/vendor-requests");
  },
  approveVendorRequest: async (vehicleId) => {
    return api.post("/admin/vendor-requests/approve", { vehicleId });
  },
  rejectVendorRequest: async (vehicleId) => {
    return api.post("/admin/vendor-requests/reject", { vehicleId });
  },
  getAllBookings: async () => {
    return api.get("/admin/bookings");
  },
  getVehicles: async () => {
    return api.get("/admin/vehicles");
  },
  updateBookingStatus: async (bookingId, status) => {
    return api.post("/admin/bookings/status", { bookingId, status });
  },
};
