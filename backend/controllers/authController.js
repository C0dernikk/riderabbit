import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/userModel.js";
import { errorHandler } from "../utils/error.js";
import {
  clearRefreshTokenCookie,
  createAccessToken,
  createRefreshToken,
  isValidEmail,
  normalizeEmail,
  respondWithAuth,
  sanitizeUser,
  setRefreshTokenCookie,
} from "../utils/auth.js";

const buildGoogleUsername = (name = "user") =>
  `${name.split(" ").join("").toLowerCase()}${Math.random()
    .toString(36)
    .slice(-8)}`;

export const refreshAccessToken = async (req, res, next) => {
  const refreshTokenValue = req.cookies.refreshToken;

  if (!refreshTokenValue) {
    return next(errorHandler(401, "No refresh token provided"));
  }

  try {
    const decoded = jwt.verify(
      refreshTokenValue,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshTokenValue) {
      clearRefreshTokenCookie(res);
      return next(errorHandler(403, "Invalid refresh token"));
    }

    const accessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    clearRefreshTokenCookie(res);
    return next(errorHandler(403, "Invalid refresh token"));
  }
};

export const signUp = async (req, res, next) => {
  const username = req.body.username?.trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!username || !email || !password) {
    return next(errorHandler(400, "username, email and password are required"));
  }

  if (!isValidEmail(email)) {
    return next(errorHandler(400, "Invalid email address"));
  }

  if (password.length < 6) {
    return next(
      errorHandler(400, "Password must be at least 6 characters long"),
    );
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return next(
        errorHandler(409, "User already exists with this email or username"),
      );
    }

    const newUser = new User({
      username,
      email,
      password,
      role: "user",
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const signIn = async (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!email || !password) {
    return next(errorHandler(400, "email and password are required"));
  }

  try {
    const user = await User.findOne({ email });
    console.log("LOGIN ATTEMPT - Email:", email);
    console.log("LOGIN ATTEMPT - User found:", user ? user.email : "null");
    console.log("LOGIN ATTEMPT - User role:", user ? user.role : "null");

    if (!user || (user.role !== "user" && user.role !== "admin")) {
      console.log("LOGIN ATTEMPT - Failed role check!");
      return next(errorHandler(404, "User not found"));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(errorHandler(401, "Invalid credentials"));
    }

    return respondWithAuth(res, user);
  } catch (error) {
    return next(error);
  }
};

export const google = async (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  const name = req.body.name?.trim();
  const photo = req.body.photo?.trim();

  if (!email || !name) {
    return next(errorHandler(400, "Google sign-in requires name and email"));
  }

  if (!isValidEmail(email)) {
    return next(errorHandler(400, "Invalid email address"));
  }

  try {
    let user = await User.findOne({ email });

    if (user && user.role !== "user") {
      return next(
        errorHandler(409, "Email already belongs to a different role"),
      );
    }

    if (!user) {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      user = new User({
        email,
        password: generatedPassword,
        profilePicture: photo,
        username: buildGoogleUsername(name),
        role: "user",
      });

      await user.save();
    }

    return respondWithAuth(res, user);
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.safeUser,
    });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return next(errorHandler(400, "Please provide an email address"));
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(errorHandler(404, "There is no user with that email"));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Ensure client URL is correct
    const clientUrl = process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",")[0] : "http://localhost:5174";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const { sendPasswordResetEmail } = await import("../services/emailService.js");
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl);

    if (!emailResult.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(errorHandler(500, "Email could not be sent"));
    }

    res.status(200).json({
      success: true,
      message: "Email sent",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(errorHandler(400, "Invalid or expired token"));
    }

    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = refreshAccessToken;
