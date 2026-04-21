import Booking from "../../models/bookingModel.js";
import Vehicle from "../../models/vehicleModel.js";
import User from "../../models/userModel.js";
import { notifyUsers } from "../../services/notificationService.js";
import { sendTripReceipt } from "../../services/emailService.js";
import { errorHandler } from "../../utils/error.js";

const buildCheckpointPayload = (req) => ({
  completedAt: new Date(),
  completedBy: req.user,
  odometer: Number.isFinite(Number(req.body.odometer))
    ? Number(req.body.odometer)
    : undefined,
  fuelLevel: req.body.fuelLevel?.trim() || "",
  notes: req.body.notes?.trim() || "",
  checklist: Array.isArray(req.body.checklist) ? req.body.checklist : [],
});

const buildInspectionPayload = (req) => ({
  completedAt: new Date(),
  completedBy: req.user,
  odometer: Number.isFinite(Number(req.body.odometer))
    ? Number(req.body.odometer)
    : undefined,
  fuelLevel: req.body.fuelLevel?.trim() || "",
  damageReported: Boolean(req.body.damageReported),
  damageNotes: req.body.damageNotes?.trim() || "",
  extraCharge: Number.isFinite(Number(req.body.extraCharge))
    ? Number(req.body.extraCharge)
    : 0,
  notes: req.body.notes?.trim() || "",
  checklist: Array.isArray(req.body.checklist) ? req.body.checklist : [],
});

const getVendorOwnedBooking = async (bookingId, vendorId) => {
  const booking = await Booking.findById(bookingId)
    .populate("userId", "username email")
    .populate({
      path: "vehicleId",
      select: "brand model addedBy",
    });

  if (!booking) {
    return null;
  }

  if (booking.vehicleId?.addedBy?.toString() !== vendorId) {
    return false;
  }

  return booking;
};

const respondWithLifecycleUpdate = (res, message, booking) =>
  res.status(200).json({
    success: true,
    message,
    booking,
  });

export const vendorBookings = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({
      addedBy: req.user,
      isDeleted: false,
    }).select("_id");

    const vehicleIds = vehicles.map((vehicle) => vehicle._id);

    if (vehicleIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        bookings: [],
      });
    }

    const bookings = await Booking.aggregate([
      {
        $match: {
          vehicleId: { $in: vehicleIds },
        },
      },
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
          createdAt: 1,
          updatedAt: 1,
          review: 1,
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
    return next(errorHandler(500, "Error fetching vendor bookings"));
  }
};

export const completePickup = async (req, res, next) => {
  try {
    const booking = await getVendorOwnedBooking(req.params.bookingId, req.user);

    if (booking === null) {
      return next(errorHandler(404, "Booking not found"));
    }

    if (booking === false) {
      return next(errorHandler(403, "You are not authorized to manage this booking"));
    }

    if (booking.status !== "BOOKED") {
      return next(errorHandler(400, "Pickup can only be completed for BOOKED bookings"));
    }

    booking.status = "PICKED_UP";
    booking.pickupCheckpoint = buildCheckpointPayload(req);
    await booking.save();

    await notifyUsers({
      recipientIds: [booking.userId?._id],
      type: "BOOKING_PICKUP_COMPLETED",
      title: "Vehicle pickup completed",
      message: `Pickup has been completed for booking ${booking._id}.`,
      relatedEntityType: "booking",
      relatedEntityId: booking._id,
      metadata: {
        bookingId: booking._id,
        vehicleId: booking.vehicleId?._id,
      },
    });

    return respondWithLifecycleUpdate(res, "Pickup completed successfully", booking);
  } catch (error) {
    return next(errorHandler(500, "Error completing pickup"));
  }
};

export const startTrip = async (req, res, next) => {
  try {
    const booking = await getVendorOwnedBooking(req.params.bookingId, req.user);

    if (booking === null) {
      return next(errorHandler(404, "Booking not found"));
    }

    if (booking === false) {
      return next(errorHandler(403, "You are not authorized to manage this booking"));
    }

    if (booking.status !== "PICKED_UP") {
      return next(errorHandler(400, "Trip can only start after pickup is completed"));
    }

    booking.status = "ON_TRIP";
    booking.tripStartCheckpoint = buildCheckpointPayload(req);
    await booking.save();

    await notifyUsers({
      recipientIds: [booking.userId?._id],
      type: "TRIP_STARTED",
      title: "Trip started",
      message: `Your trip for booking ${booking._id} has started.`,
      relatedEntityType: "booking",
      relatedEntityId: booking._id,
      metadata: {
        bookingId: booking._id,
        vehicleId: booking.vehicleId?._id,
      },
    });

    return respondWithLifecycleUpdate(res, "Trip started successfully", booking);
  } catch (error) {
    return next(errorHandler(500, "Error starting trip"));
  }
};

export const endTrip = async (req, res, next) => {
  try {
    const booking = await getVendorOwnedBooking(req.params.bookingId, req.user);

    if (booking === null) {
      return next(errorHandler(404, "Booking not found"));
    }

    if (booking === false) {
      return next(errorHandler(403, "You are not authorized to manage this booking"));
    }

    if (!["ON_TRIP", "OVERDUE"].includes(booking.status)) {
      return next(errorHandler(400, "Trip can only end from ON_TRIP or OVERDUE"));
    }

    booking.status = "TRIP_ENDED";
    booking.tripEndCheckpoint = buildCheckpointPayload(req);
    await booking.save();

    await notifyUsers({
      recipientIds: [booking.userId?._id],
      type: "TRIP_ENDED",
      title: "Trip ended",
      message: `Your trip for booking ${booking._id} has ended and return inspection is pending.`,
      relatedEntityType: "booking",
      relatedEntityId: booking._id,
      metadata: {
        bookingId: booking._id,
        vehicleId: booking.vehicleId?._id,
      },
    });

    return respondWithLifecycleUpdate(res, "Trip ended successfully", booking);
  } catch (error) {
    return next(errorHandler(500, "Error ending trip"));
  }
};

export const completeReturnInspection = async (req, res, next) => {
  try {
    const booking = await getVendorOwnedBooking(req.params.bookingId, req.user);

    if (booking === null) {
      return next(errorHandler(404, "Booking not found"));
    }

    if (booking === false) {
      return next(errorHandler(403, "You are not authorized to manage this booking"));
    }

    if (booking.status !== "TRIP_ENDED") {
      return next(
        errorHandler(400, "Return inspection can only be completed after trip end")
      );
    }

    const inspection = buildInspectionPayload(req);
    booking.returnInspection = inspection;
    booking.status = "TRIP_COMPLETED";
    await booking.save();

    // Release vehicle back to available
    await Vehicle.findByIdAndUpdate(booking.vehicleId?._id, { isAvailable: true });

    const vendor = await User.findById(req.user);
    const adminEmail = process.env.ADMIN_EMAIL || "dev.nikk37@gmail.com";

    const finalAmount = booking.totalPrice + (inspection.extraCharge || 0);
    const tripDetails = {
      bookingId: booking._id,
      vehicleName: `${booking.vehicleId?.brand || 'Vehicle'} ${booking.vehicleId?.model || ''}`,
      totalAmount: finalAmount,
      vendorAmount: finalAmount * 0.8,
      adminAmount: finalAmount * 0.2,
    };

    if (booking.userId?.email && vendor?.email) {
      sendTripReceipt(booking.userId.email, vendor.email, adminEmail, tripDetails).catch((error) => {
        console.error("Error sending trip receipt:", error);
      });
    }

    await notifyUsers({
      recipientIds: [booking.userId?._id],
      type: "RETURN_INSPECTION_COMPLETED",
      title: "Return inspection completed",
      message: `Return inspection is complete for booking ${booking._id}.`,
      relatedEntityType: "booking",
      relatedEntityId: booking._id,
      metadata: {
        bookingId: booking._id,
        vehicleId: booking.vehicleId?._id,
        extraCharge: inspection.extraCharge,
        damageReported: inspection.damageReported,
      },
    });

    return respondWithLifecycleUpdate(
      res,
      "Return inspection completed successfully",
      booking
    );
  } catch (error) {
    return next(errorHandler(500, "Error completing return inspection"));
  }
};
