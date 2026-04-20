import express from "express";
import {
  getCurrentUser,
  google,
  refreshAccessToken,
  signIn,
  signUp,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { loadCurrentUser, verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/register", signUp);
router.post("/login", signIn);
router.post("/google", google);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", verifyToken, loadCurrentUser, getCurrentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
