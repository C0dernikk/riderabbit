import api from "./api";

/**
 * Vehicles API services.
 * Fully aligned with backend userRoute.js, vendorRoute.js, and adminRoute.js
 */
export const vehicleService = {
  // Public/User Endpoints
  getAllVehicles: async (params) => {
    return api.get("/user/vehicles", { params });
  },
  getVehicleById: async (id) => {
    return api.get(`/user/vehicles/${id}`);
  },
  getVehicleReviews: async (id) => {
    return api.get(`/user/vehicles/${id}/reviews`);
  },
  searchVehicles: async (filters) => {
    return api.post("/user/vehicles/filter", filters);
  },
  searchNearbyVehicles: async (geoData) => {
    return api.post("/user/vehicles/nearby", geoData);
  },
  getAvailableVehicles: async (searchParams) => {
    return api.post("/user/vehicles/available", searchParams);
  },
  checkAvailability: async (checkData) => {
    return api.post("/user/vehicles/check-availability", checkData);
  },

  // Vendor Endpoints
  getVendorVehicles: async () => {
    return api.get("/vendor/vehicles");
  },
  addVendorVehicle: async (formData) => {
    return api.post("/vendor/vehicles", formData);
  },
  updateVendorVehicle: async (id, formData) => {
    return api.put(`/vendor/vehicles/${id}`, formData);
  },
  deleteVendorVehicle: async (id) => {
    return api.delete(`/vendor/vehicles/${id}`);
  },

  // Admin Endpoints
  adminAddVehicle: async (formData) => {
    return api.post("/admin/vehicles", formData);
  },
  adminGetVehicles: async () => {
    return api.get("/admin/vehicles");
  },
  adminUpdateVehicle: async (id, formData) => {
    return api.put(`/admin/vehicles/${id}`, formData);
  },
  adminDeleteVehicle: async (id) => {
    return api.delete(`/admin/vehicles/${id}`);
  },

  // Master Data
  getMasterData: async () => {
    return api.get("/user/master-data");
  },
  getAdminVehicleModels: async () => {
    return api.get("/admin/vehicle-models");
  },
  getAdminBrands: async () => {
    return api.get("/admin/brands");
  },
  getAdminLocations: async () => {
    return api.get("/admin/locations");
  },
};
