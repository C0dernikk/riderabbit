import api from "./api";

/**
 * Bookings API services.
 * Fully aligned with backend userRoute.js, vendorRoute.js, and adminRoute.js
 */
export const bookingService = {
  // User Bookings
  createBooking: async (bookingData) => {
    return api.post("/user/bookings", bookingData);
  },
  getUserBookings: async () => {
    return api.get("/user/bookings");
  },
  getLatestBooking: async () => {
    return api.get("/user/bookings/latest");
  },
  cancelBooking: async (id) => {
    return api.patch(`/user/bookings/${id}/cancel`);
  },
  sendBookingEmail: async (id) => {
    return api.post(`/user/bookings/${id}/email`);
  },
  createReview: async (id, reviewData) => {
    return api.post(`/user/bookings/${id}/review`, reviewData);
  },

  // Payment Endpoints
  createRazorpayOrder: async (bookingDetails) => {
    return api.post("/user/payments/razorpay", bookingDetails);
  },
  verifyPayment: async (verificationData) => {
    return api.post("/user/payments/verify", verificationData);
  },

  // Vendor Bookings
  getVendorBookings: async () => {
    return api.get("/vendor/bookings");
  },
  changeBookingStatus: async (statusData) => {
    return api.post("/vendor/bookings/status", statusData);
  },
  completePickup: async (bookingId, pickupData) => {
    return api.post(`/vendor/bookings/${bookingId}/pickup`, pickupData);
  },
  startTrip: async (bookingId) => {
    return api.post(`/vendor/bookings/${bookingId}/start-trip`);
  },
  endTrip: async (bookingId) => {
    return api.post(`/vendor/bookings/${bookingId}/end-trip`);
  },
  completeInspection: async (bookingId, inspectionData) => {
    return api.post(
      `/vendor/bookings/${bookingId}/return-inspection`,
      inspectionData,
    );
  },

  // Admin Bookings
  adminGetBookings: async () => {
    return api.get("/admin/bookings");
  },
  adminChangeStatus: async (statusData) => {
    return api.post("/admin/bookings/status", statusData);
  },
};
