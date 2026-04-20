import express from "express";
import {
  adminProfile,
  adminSignin,
  getAllUsers,
  getAllVendors,
  deleteUser as adminDeleteUser,
} from "../controllers/adminControllers/adminController.js";
import {
  allBookings,
  changeStatus,
} from "../controllers/adminControllers/bookingsController.js";
import {
  addVehicle,
  deleteVehicle,
  editVehicle,
  getDashboardStats,
  showVehicles,
  checkSystemHealth,
} from "../controllers/adminControllers/dashboardController.js";
import {
  getBrands,
  getCarModels,
  getLocations,
  insertDummyData,
} from "../controllers/adminControllers/masterCollectionController.js";
import {
  approveVendorVehicleRequest,
  fetchVendorVehicleRequests,
  rejectVendorVehicleRequest,
} from "../controllers/adminControllers/vendorVehicleRequests.js";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.js";
import { signOut } from "../controllers/userControllers/userController.js";
import { multerUploads } from "../utils/multer.js";
import {
  authorizeRoles,
  loadCurrentUser,
  verifyToken,
} from "../utils/verifyUser.js";

const router = express.Router();

const requireAdmin = [verifyToken, loadCurrentUser, authorizeRoles("admin")];

router.post("/login", adminSignin);
router.get("/logout", ...requireAdmin, signOut);

router.get("/profile", ...requireAdmin, adminProfile);
router.get("/allUsers", ...requireAdmin, getAllUsers);
router.get("/allVendors", ...requireAdmin, getAllVendors);
router.delete("/deleteUser/:userId", ...requireAdmin, adminDeleteUser);
router.get("/dashboard/stats", ...requireAdmin, getDashboardStats);
router.get("/health", ...requireAdmin, checkSystemHealth);

router.get("/notifications", ...requireAdmin, getMyNotifications);
router.patch(
  "/notifications/read-all",
  ...requireAdmin,
  markAllNotificationsAsRead,
);
router.patch(
  "/notifications/:notificationId/read",
  ...requireAdmin,
  markNotificationAsRead,
);

router.post("/vehicles", ...requireAdmin, multerUploads, addVehicle);
router.get("/vehicles", ...requireAdmin, showVehicles);
router.put("/vehicles/:id", ...requireAdmin, editVehicle);
router.delete("/vehicles/:id", ...requireAdmin, deleteVehicle);

router.post("/dummy-data", ...requireAdmin, insertDummyData);
router.get("/vehicle-models", ...requireAdmin, getCarModels);
router.get("/brands", ...requireAdmin, getBrands);
router.get("/locations", ...requireAdmin, getLocations);

router.get("/vendor-requests", ...requireAdmin, fetchVendorVehicleRequests);
router.post(
  "/vendor-requests/approve",
  ...requireAdmin,
  approveVendorVehicleRequest,
);
router.post(
  "/vendor-requests/reject",
  ...requireAdmin,
  rejectVendorVehicleRequest,
);

router.get("/bookings", ...requireAdmin, allBookings);
router.post("/bookings/status", ...requireAdmin, changeStatus);

export default router;
