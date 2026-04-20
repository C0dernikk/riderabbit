import User from "../../models/userModel.js";
import {
  normalizeEmail,
  respondWithAuth,
  sanitizeUser,
} from "../../utils/auth.js";
import { errorHandler } from "../../utils/error.js";

export const adminSignin = async (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!email || !password) {
    return next(errorHandler(400, "email and password are required"));
  }

  try {
    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return next(errorHandler(404, "Admin not found"));
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

export const adminProfile = async (req, res, next) => {
  try {
    const admin = req.currentUser || (await User.findById(req.user));

    if (!admin || admin.role !== "admin") {
      return next(errorHandler(403, "Only admins can access this profile"));
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUser(admin),
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 });
    return res.status(200).json(users.map(sanitizeUser));
  } catch (error) {
    return next(errorHandler(500, "Error fetching users"));
  }
};

export const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await User.aggregate([
      { $match: { role: "vendor" } },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "addedBy",
          as: "vehicles",
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "vehicles._id",
          foreignField: "vehicleId",
          as: "bookings",
        },
      },
      {
        $addFields: {
          totalRevenue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$bookings",
                    as: "booking",
                    cond: { $ne: ["$$booking.status", "CANCELED"] },
                  },
                },
                as: "validBooking",
                in: "$$validBooking.totalPrice",
              },
            },
          },
        },
      },
      {
        $project: {
          vehicles: 0,
          bookings: 0,
          password: 0,
          refreshToken: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json(vendors.map(sanitizeUser));
  } catch (error) {
    console.error("Error fetching vendors with revenue:", error);
    return next(errorHandler(500, "Error fetching vendors"));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(errorHandler(500, "Error deleting user"));
  }
};
