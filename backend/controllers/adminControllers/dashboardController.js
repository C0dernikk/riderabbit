import cloudinary from "../../utils/cloudinaryConfig.js";
import Booking from "../../models/bookingModel.js";
import Vehicle from "../../models/vehicleModel.js";
import { dataUri } from "../../utils/multer.js";
import { errorHandler } from "../../utils/error.js";
import mongoose from "mongoose";

export const addVehicle = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return next(errorHandler(400, "At least one vehicle image is required"));
    }

    const {
      registrationNumber,
      brand,
      model,
      title,
      description,
      price,
      yearMade,
      fuelType,
      seats,
      transmission,
      insuranceEnd,
      registrationEnd,
      pollutionEnd,
      carType,
      location,
      district,
      lat,
      lng,
    } = req.body;

    if (
      !registrationNumber ||
      !brand ||
      !model ||
      !price ||
      !location ||
      !district
    ) {
      return next(
        errorHandler(
          400,
          "registrationNumber, brand, model, price, location and district are required"
        )
      );
    }

    const fileData = dataUri(req);
    const uploadedImages = await Promise.all(
      fileData.map((file) => cloudinary.uploader.upload(file.data))
    );

    const vehicle = new Vehicle({
      registrationNumber,
      brand,
      model,
      title,
      description,
      price,
      yearMade,
      fuelType,
      seats,
      transmission,
      insuranceEnd,
      registrationEnd,
      pollutionEnd,
      carType,
      location,
      district,
      locationPoint: {
        type: 'Point',
        coordinates: [
          lng ? parseFloat(lng) : 76.2711,
          lat ? parseFloat(lat) : 10.8505
        ]
      },
      images: uploadedImages.map((image) => image.secure_url),
      addedBy: req.user,
    });

    await vehicle.save();

    return res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, "Vehicle already exists"));
    }

    return next(errorHandler(500, "Error adding vehicle"));
  }
};

export const showVehicles = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 10,
      brand,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      location,
      isApproved,
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);

    const filter = { isDeleted: false };

    if (brand) filter.brand = brand;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (location) filter.location = location;
    if (isApproved !== undefined) filter.isApproved = isApproved === "true";

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Vehicle.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      vehicles,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedVehicle) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    return next(errorHandler(500, "Error deleting vehicle"));
  }
};

export const editVehicle = async (req, res, next) => {
  try {
    if (!Object.keys(req.body).length) {
      return next(errorHandler(400, "No vehicle fields provided for update"));
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    return res.status(200).json({
      success: true,
      vehicle: updatedVehicle,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, "Duplicate vehicle field value"));
    }

    return next(errorHandler(500, "Error updating vehicle"));
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalVehicles, 
      totalBookings, 
      activeBookings, 
      completedBookings, 
      revenueData, 
      monthlyBookings,
      monthlyRevenue,
      bookingStatusDistribution
    ] = await Promise.all([
        Vehicle.countDocuments({ isDeleted: false }),
        Booking.countDocuments(),
        Booking.countDocuments({
          status: { $in: ["BOOKED", "PICKED_UP", "ON_TRIP", "OVERDUE", "TRIP_ENDED"] },
        }),
        Booking.countDocuments({ status: "TRIP_COMPLETED" }),
        Booking.aggregate([
          { $match: { status: "TRIP_COMPLETED" } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalPrice" },
            },
          },
        ]),
        Booking.aggregate([
          {
            $group: {
              _id: { month: { $month: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.month": 1 } },
        ]),
        Booking.aggregate([
          { $match: { status: "TRIP_COMPLETED" } },
          {
            $group: {
              _id: { month: { $month: "$createdAt" } },
              revenue: { $sum: "$totalPrice" },
            },
          },
          { $sort: { "_id.month": 1 } },
        ]),
        Booking.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ])
      ]);

    return res.status(200).json({
      success: true,
      totalVehicles,
      totalBookings,
      activeBookings,
      completedBookings,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      monthlyBookings,
      monthlyRevenue,
      bookingStatusDistribution
    });
  } catch (error) {
    return next(error);
  }
};

export const checkSystemHealth = async (req, res, next) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? "connected" : "disconnected";
    
    const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET);
    const paymentStatus = razorpayConfigured ? "configured" : "missing";

    return res.status(200).json({
      success: true,
      dbStatus,
      paymentStatus,
      timestamp: Date.now()
    });
  } catch (error) {
    return next(errorHandler(500, "Error checking system health"));
  }
};
