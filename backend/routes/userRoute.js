import express from "express";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.js";
import {
  checkAvailability,
  listAllVehicles,
  searchCar,
  showVehicleDetails,
  searchCarsNearMe,
} from "../controllers/userControllers/userAllVehiclesController.js";
import {
  bookCar,
  cancelBooking,
  findBookingsOfUser,
  getAvailableVehicles,
  latestBookings,
  razorpayOrder,
  sendBookingDetailsEmail,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/userControllers/userBookingController.js";
import { editUserProfile } from "../controllers/userControllers/userProfileController.js";
import { multerUploads } from "../utils/multer.js";
import {
  createBookingReview,
  getVehicleReviews,
} from "../controllers/userControllers/userReviewController.js";
import {
  deleteUser,
  signOut,
  updateUser,
} from "../controllers/userControllers/userController.js";
import { listMasterDataForPublic } from "../controllers/userControllers/masterDataPublicController.js";
import {
  authorizeRoles,
  loadCurrentUser,
  verifyToken,
} from "../utils/verifyUser.js";

const router = express.Router();

const requireUser = [verifyToken, loadCurrentUser, authorizeRoles("user")];

router.put("/profile/:id", ...requireUser, updateUser);
router.delete("/profile/:id", ...requireUser, deleteUser);
router.put("/profile/edit/:id", ...requireUser, multerUploads, editUserProfile);
router.get("/logout", ...requireUser, signOut);

router.get("/notifications", ...requireUser, getMyNotifications);
router.patch("/notifications/read-all", ...requireUser, markAllNotificationsAsRead);
router.patch(
  "/notifications/:notificationId/read",
  ...requireUser,
  markNotificationAsRead
);

router.get("/master-data", listMasterDataForPublic);

router.get("/vehicles", listAllVehicles);
router.get("/vehicles/:id", showVehicleDetails);
router.get("/vehicles/:id/reviews", getVehicleReviews);
router.post("/vehicles/filter", searchCar);
router.post("/vehicles/nearby", searchCarsNearMe);
router.post("/vehicles/available", getAvailableVehicles);
router.post("/vehicles/check-availability", checkAvailability);

router.post("/payments/razorpay", ...requireUser, razorpayOrder);
router.post("/payments/verify", ...requireUser, verifyPayment);
router.post("/payments/webhook", razorpayWebhook);

router.post("/bookings", ...requireUser, bookCar);
router.get("/bookings", ...requireUser, findBookingsOfUser);
router.get("/bookings/latest", ...requireUser, latestBookings);
router.patch("/bookings/:bookingId/cancel", ...requireUser, cancelBooking);
router.post("/bookings/:bookingId/email", ...requireUser, sendBookingDetailsEmail);
router.post("/bookings/:bookingId/review", ...requireUser, createBookingReview);

export default router;
