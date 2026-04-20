import cloudinary from "../../utils/cloudinaryConfig.js";
import Vehicle from "../../models/vehicleModel.js";
import Booking from "../../models/bookingModel.js";
import { dataUri } from "../../utils/multer.js";
import { errorHandler } from "../../utils/error.js";

const VEHICLE_UPDATABLE_FIELDS = [
  "registrationNumber",
  "title",
  "description",
  "brand",
  "model",
  "yearMade",
  "fuelType",
  "seats",
  "transmission",
  "price",
  "basePackage",
  "withOrWithoutFuel",
  "insuranceEnd",
  "registrationEnd",
  "pollutionEnd",
  "certification",
  "carType",
  "location",
  "district",
];

export const vendorAddVehicle = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return next(errorHandler(400, "At least one vehicle image is required"));
    }

    const {
      registrationNumber,
      title,
      description,
      brand,
      model,
      yearMade,
      fuelType,
      seats,
      transmission,
      price,
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
          "registrationNumber, brand, model, price, location and district are required",
        ),
      );
    }

    const files = dataUri(req);
    const uploadedImages = [];
    const certification = {};

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.data);
      if (file.fieldname === "image") {
        uploadedImages.push(result.secure_url);
      } else if (file.fieldname === "insurance_image") {
        certification.insurance = result.secure_url;
      } else if (file.fieldname === "rc_book_image") {
        certification.rc = result.secure_url;
      } else if (file.fieldname === "polution_image") {
        certification.pollution = result.secure_url;
      }
    }

    const newVehicle = new Vehicle({
      registrationNumber,
      title,
      description,
      brand,
      model,
      yearMade,
      fuelType,
      seats,
      transmission,
      images: uploadedImages,
      certification,
      price,
      location,
      district,
      locationPoint: {
        type: 'Point',
        coordinates: [
          lng ? parseFloat(lng) : 76.2711,
          lat ? parseFloat(lat) : 10.8505
        ]
      },
      addedBy: req.user,
      isApproved: false,
      isRejected: false,
      isDeleted: false,
    });

    await newVehicle.save();

    return res.status(201).json({
      success: true,
      message: "Vehicle added successfully and is pending admin approval",
      vehicle: newVehicle,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        errorHandler(
          409,
          "A vehicle with this registration number already exists",
        ),
      );
    }

    if (error.name === "ValidationError") {
      return next(errorHandler(400, error.message));
    }

    console.error("VENDOR ADD VEHICLE ERROR:", error);
    return next(errorHandler(500, "Error adding vehicle"));
  }
};

export const vendorEditVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle || vehicle.isDeleted) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    if (vehicle.addedBy?.toString() !== req.user) {
      return next(
        errorHandler(403, "You are not allowed to edit this vehicle"),
      );
    }

    const updates = {};

    for (const field of VEHICLE_UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(
        errorHandler(400, "No valid vehicle fields provided for update"),
      );
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...updates,
          isApproved: false,
          isRejected: false,
        },
      },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully and sent for re-approval",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        errorHandler(
          409,
          "A vehicle with this registration number already exists",
        ),
      );
    }

    return next(errorHandler(500, "Error updating vehicle"));
  }
};

export const vendorDeleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle || vehicle.isDeleted) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    if (vehicle.addedBy?.toString() !== req.user) {
      return next(
        errorHandler(403, "You are not allowed to delete this vehicle"),
      );
    }

    vehicle.isDeleted = true;
    await vehicle.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    return next(errorHandler(500, "Error deleting vehicle"));
  }
};

export const showVendorVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({
      addedBy: req.user,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    return next(errorHandler(500, "Error fetching vendor vehicles"));
  }
};

export const getVendorStats = async (req, res, next) => {
  try {
    const vendorId = req.user;

    const [
      totalVehicles,
      totalBookings,
      activeBookings,
      completedBookings,
      revenueData,
      monthlyEarnings,
      bookingStatusDistribution,
    ] = await Promise.all([
      Vehicle.countDocuments({ addedBy: vendorId, isDeleted: false }),
      Booking.countDocuments({
        vehicleId: {
          $in: await Vehicle.find({ addedBy: vendorId }).select("_id"),
        },
      }),
      Booking.countDocuments({
        vehicleId: {
          $in: await Vehicle.find({ addedBy: vendorId }).select("_id"),
        },
        status: {
          $in: ["BOOKED", "PICKED_UP", "ON_TRIP", "OVERDUE", "TRIP_ENDED"],
        },
      }),
      Booking.countDocuments({
        vehicleId: {
          $in: await Vehicle.find({ addedBy: vendorId }).select("_id"),
        },
        status: "TRIP_COMPLETED",
      }),
      Booking.aggregate([
        {
          $match: {
            vehicleId: {
              $in: (
                await Vehicle.find({ addedBy: vendorId }).select("_id")
              ).map((v) => v._id),
            },
            status: "TRIP_COMPLETED",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
      ]),
      Booking.aggregate([
        {
          $match: {
            vehicleId: {
              $in: (
                await Vehicle.find({ addedBy: vendorId }).select("_id")
              ).map((v) => v._id),
            },
            status: "TRIP_COMPLETED",
          },
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            count: { $sum: "$totalPrice" },
          },
        },
        { $sort: { "_id.month": 1 } },
      ]),
      Booking.aggregate([
        {
          $match: {
            vehicleId: {
              $in: (
                await Vehicle.find({ addedBy: vendorId }).select("_id")
              ).map((v) => v._id),
            },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
    ]);

    return res.status(200).json({
      success: true,
      totalVehicles,
      totalBookings,
      activeBookings,
      completedBookings,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      monthlyEarnings,
      bookingStatusDistribution,
    });
  } catch (error) {
    return next(errorHandler(500, "Error fetching vendor stats"));
  }
};
