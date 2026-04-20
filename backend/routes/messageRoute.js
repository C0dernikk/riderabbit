import express from "express";
import { getMessagesByBookingId, getInbox, getUnreadCount, markAsRead } from "../controllers/messageController.js";
import { verifyToken, loadCurrentUser } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/inbox/all", verifyToken, loadCurrentUser, getInbox);
router.get("/unread-count", verifyToken, loadCurrentUser, getUnreadCount);
router.put("/mark-read/:bookingId", verifyToken, loadCurrentUser, markAsRead);
router.get("/:bookingId", verifyToken, loadCurrentUser, getMessagesByBookingId);

export default router;
