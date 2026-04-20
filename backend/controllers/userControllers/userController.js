import User from "../../models/userModel.js";
import {
  clearRefreshTokenCookie,
  isValidEmail,
  normalizeEmail,
  sanitizeUser,
} from "../../utils/auth.js";
import { errorHandler } from "../../utils/error.js";

export const updateUser = async (req, res, next) => {
  if (req.user !== req.params.id) {
    return next(errorHandler(403, "You can only update your own account"));
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (req.body.username) {
      const username = req.body.username.trim();
      const existingUser = await User.findOne({
        username,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return next(errorHandler(409, "Username already in use"));
      }

      user.username = username;
    }

    if (req.body.email) {
      const email = normalizeEmail(req.body.email);

      if (!isValidEmail(email)) {
        return next(errorHandler(400, "Invalid email address"));
      }

      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return next(errorHandler(409, "Email already in use"));
      }

      user.email = email;
    }

    if (req.body.profilePicture) {
      user.profilePicture = req.body.profilePicture.trim();
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return next(errorHandler(400, "Password must be at least 6 characters long"));
      }

      user.password = req.body.password;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user !== req.params.id) {
    return next(errorHandler(403, "You can only delete your own account"));
  }

  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return next(errorHandler(404, "User not found"));
    }

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user,
      { refreshToken: "" },
      { new: true }
    );

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error) {
    return next(errorHandler(500, "Error signing out"));
  }
};
