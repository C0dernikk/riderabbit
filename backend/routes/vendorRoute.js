import express from "express";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.js";
import {
  completePickup,
  completeReturnInspection,
  endTrip,
  startTrip,
  vendorBookings,
} from "../controllers/vendorControllers/vendorBookingsController.js";
import { changeStatus } from "../controllers/adminControllers/bookingsController.js";
import {
  showVendorVehicles,
  vendorAddVehicle,
  vendorDeleteVehicle,
  vendorEditVehicle,
  getVendorStats,
} from "../controllers/vendorControllers/vendorCrudController.js";
import {
  vendorGoogle,
  vendorSignin,
  vendorSignout,
  vendorSignup,
  updatePayoutDetails,
} from "../controllers/vendorControllers/vendorController.js";
import { editUserProfile } from "../controllers/userControllers/userProfileController.js";
import { multerUploads } from "../utils/multer.js";
import {
  authorizeRoles,
  loadCurrentUser,
  verifyToken,
} from "../utils/verifyUser.js";

const router = express.Router();

const requireVendor = [verifyToken, loadCurrentUser, authorizeRoles("vendor")];

router.post("/register", vendorSignup);
router.post("/login", vendorSignin);
router.post("/google", vendorGoogle);
router.get("/logout", ...requireVendor, vendorSignout);
router.put("/profile/edit/:id", ...requireVendor, multerUploads, editUserProfile);
router.put("/payouts", ...requireVendor, updatePayoutDetails);

router.get("/notifications", ...requireVendor, getMyNotifications);
router.patch(
  "/notifications/read-all",
  ...requireVendor,
  markAllNotificationsAsRead,
);
router.patch(
  "/notifications/:notificationId/read",
  ...requireVendor,
  markNotificationAsRead,
);

router.post("/vehicles", ...requireVendor, multerUploads, vendorAddVehicle);
router.get("/vehicles", ...requireVendor, showVendorVehicles);
router.get("/dashboard/stats", ...requireVendor, getVendorStats);
router.put("/vehicles/:id", ...requireVendor, multerUploads, vendorEditVehicle);
router.delete("/vehicles/:id", ...requireVendor, vendorDeleteVehicle);

router.get("/bookings", ...requireVendor, vendorBookings);
router.post("/bookings/status", ...requireVendor, changeStatus);
router.post("/bookings/:bookingId/pickup", ...requireVendor, completePickup);
router.post("/bookings/:bookingId/start-trip", ...requireVendor, startTrip);
router.post("/bookings/:bookingId/end-trip", ...requireVendor, endTrip);
router.post(
  "/bookings/:bookingId/return-inspection",
  ...requireVendor,
  completeReturnInspection,
);

export default router;
