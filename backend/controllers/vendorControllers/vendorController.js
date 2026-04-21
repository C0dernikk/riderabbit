import User from "../../models/userModel.js";
import {
  clearRefreshTokenCookie,
  isValidEmail,
  normalizeEmail,
  respondWithAuth,
} from "../../utils/auth.js";
import { errorHandler } from "../../utils/error.js";

const buildVendorUsername = (name = "vendor") =>
  `${name.split(" ").join("").toLowerCase()}${Math.random()
    .toString(36)
    .slice(-6)}`;

export const vendorSignup = async (req, res, next) => {
  const name = req.body.name?.trim();
  const username = req.body.username?.trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!name || !username || !email || !password) {
    return next(errorHandler(400, "name, username, email and password are required"));
  }

  if (!isValidEmail(email)) {
    return next(errorHandler(400, "Invalid email address"));
  }

  if (password.length < 6) {
    return next(errorHandler(400, "Password must be at least 6 characters long"));
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return next(errorHandler(409, "Vendor already exists with this email or username"));
    }

    const user = new User({
      name,
      username,
      email,
      password,
      role: "vendor",
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const vendorSignin = async (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!email || !password) {
    return next(errorHandler(400, "email and password are required"));
  }

  try {
    const user = await User.findOne({ email });

    if (!user || user.role !== "vendor") {
      return next(errorHandler(404, "Vendor not found"));
    }

    const validPassword = await user.comparePassword(password);

    if (!validPassword) {
      return next(errorHandler(401, "Invalid credentials"));
    }

    return respondWithAuth(res, user);
  } catch (error) {
    return next(error);
  }
};

export const vendorSignout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user,
      { refreshToken: "" },
      { new: true }
    );

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Vendor signed out successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const vendorGoogle = async (req, res, next) => {
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

    if (user && user.role !== "vendor") {
      return next(errorHandler(409, "Email already belongs to a different role"));
    }

    if (!user) {
      const generatedPassword =
        Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      user = new User({
        name,
        username: buildVendorUsername(name),
        email,
        password: generatedPassword,
        profilePicture: photo,
        role: "vendor",
      });

      await user.save();
    }

    return respondWithAuth(res, user);
  } catch (error) {
    return next(error);
  }
};

export const updatePayoutDetails = async (req, res, next) => {
  try {
    const { bankName, accountName, accountNumber, ifscCode, upiId } = req.body;

    const user = await User.findById(req.user);
    if (!user || user.role !== "vendor") {
      return next(errorHandler(404, "Vendor not found"));
    }

    user.payoutDetails = {
      bankName: bankName?.trim() || "",
      accountName: accountName?.trim() || "",
      accountNumber: accountNumber?.trim() || "",
      ifscCode: ifscCode?.trim() || "",
      upiId: upiId?.trim() || "",
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Payout details updated successfully",
      payoutDetails: user.payoutDetails,
    });
  } catch (error) {
    return next(errorHandler(500, "Failed to update payout details"));
  }
};
