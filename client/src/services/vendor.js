import api from "./api";

export const vendorService = {
  editProfile: async (id, formData) => {
    return api.put(`/vendor/profile/edit/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getDashboardStats: async () => {
    return api.get("/vendor/dashboard/stats");
  },
  getMyVehicles: async () => {
    return api.get("/vendor/vehicles");
  },
  addVehicle: async (formData) => {
    return api.post("/vendor/vehicles", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateVehicle: async (id, formData) => {
    return api.put(`/vendor/vehicles/${id}`, formData);
  },
  deleteVehicle: async (id) => {
    return api.delete(`/vendor/vehicles/${id}`);
  },
  getMyBookings: async () => {
    return api.get("/vendor/bookings");
  },
  updateBookingStatus: async (bookingId, status) => {
    return api.post("/vendor/bookings/status", { bookingId, status });
  },
  completePickup: async (bookingId) => {
    return api.post(`/vendor/bookings/${bookingId}/pickup`);
  },
  startTrip: async (bookingId) => {
    return api.post(`/vendor/bookings/${bookingId}/start-trip`);
  },
  endTrip: async (bookingId) => {
    return api.post(`/vendor/bookings/${bookingId}/end-trip`);
  },
  completeReturnInspection: async (bookingId) => {
    return api.post(`/vendor/bookings/${bookingId}/return-inspection`);
  },
  updatePayoutDetails: async (payoutData) => {
    return api.put("/vendor/payouts", payoutData);
  },
};
