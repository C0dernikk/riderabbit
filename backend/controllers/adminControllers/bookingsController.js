import Booking, { BOOKING_STATUSES } from "../../models/bookingModel.js";
import Vehicle from "../../models/vehicleModel.js";
import { errorHandler } from "../../utils/error.js";

const allowedTransitions = {
  NOT_BOOKED: ["BOOKED"],
  BOOKED: ["PICKED_UP", "NOT_PICKED", "CANCELED"],
  PICKED_UP: ["ON_TRIP", "OVERDUE"],
  ON_TRIP: ["TRIP_ENDED", "OVERDUE"],
  OVERDUE: ["TRIP_ENDED"],
  TRIP_ENDED: ["TRIP_COMPLETED"],
  NOT_PICKED: ["CANCELED"],
  CANCELED: [],
  TRIP_COMPLETED: [],
};

export const allBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "bookingId",
          as: "review",
        },
      },
      {
        $unwind: {
          path: "$vehicleDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$review",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          vehicleDetails: 1,
          vehicleId: 1,
          userId: 1,
          pickUpDate: 1,
          dropOffDate: 1,
          pickUpLocation: 1,
          dropOffLocation: 1,
          totalPrice: 1,
          razorPayOrderId: 1,
          razorPayPaymentId: 1,
          status: 1,
          pickupCheckpoint: 1,
          tripStartCheckpoint: 1,
          tripEndCheckpoint: 1,
          returnInspection: 1,
          review: 1,
          createdAt: 1,
          updatedAt: 1,
          customer: {
            _id: "$customer._id",
            username: "$customer.username",
            email: "$customer.email",
            phoneNumber: "$customer.phoneNumber",
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log(error);
    return next(errorHandler(500, "Error fetching bookings"));
  }
};

export const changeStatus = async (req, res, next) => {
  try {
    const bookingId = req.body.id || req.body.bookingId;
    const { status } = req.body;

    if (!bookingId || !status) {
      return next(errorHandler(400, "bookingId and status are required"));
    }

    if (!BOOKING_STATUSES.includes(status)) {
      return next(errorHandler(400, "Invalid booking status"));
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    // Admin and Vendor override: Allow updating to any valid status without transition restrictions
    booking.status = status;
    await booking.save({ validateBeforeSave: false });

    // Toggle vehicle availability based on new status
    const TERMINAL_STATUSES = ["TRIP_COMPLETED", "CANCELED", "NOT_PICKED"];
    if (status === "BOOKED") {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: false });
    } else if (TERMINAL_STATUSES.includes(status)) {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: true });
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.log(error);
    return next(errorHandler(500, "Error updating booking status"));
  }
};
