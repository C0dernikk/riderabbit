import "../../config/env.js";
import crypto from "crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import Booking from "../../models/bookingModel.js";
import User from "../../models/userModel.js";
import Vehicle from "../../models/vehicleModel.js";
import { availableAtDate } from "../../services/checkAvailableVehicle.js";
import { notifyUsers } from "../../services/notificationService.js";
import { sendBookingConfirmation, sendVendorBookingAlert } from "../../services/emailService.js";
import { errorHandler } from "../../utils/error.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const parseBookingWindow = (pickUpDate, dropOffDate) => {
  const pickUp = new Date(pickUpDate);
  const dropOff = new Date(dropOffDate);

  if (Number.isNaN(pickUp.getTime()) || Number.isNaN(dropOff.getTime())) {
    return { error: "Invalid booking dates" };
  }

  if (pickUp >= dropOff) {
    return { error: "dropOffDate must be after pickUpDate" };
  }

  const bufferedDropOff = new Date(dropOff);
  bufferedDropOff.setHours(bufferedDropOff.getHours() + 3);

  return { pickUp, dropOff, bufferedDropOff };
};

const calculateBillableDays = (pickUp, dropOff) =>
  Math.max(1, Math.ceil((dropOff.getTime() - pickUp.getTime()) / MS_PER_DAY));

const buildBookingAggregation = (matchStage) => [
  { $match: matchStage },
  {
    $lookup: {
      from: "vehicles",
      localField: "vehicleId",
      foreignField: "_id",
      as: "vehicle",
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
      path: "$vehicle",
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
    $sort: { createdAt: -1 },
  },
];

export const bookCar = async (req, res, next) => {
  try {
    const {
      vehicle_id,
      pickUpDate,
      dropOffDate,
      pickUpLocation,
      dropOffLocation,
      razorpayPaymentId,
      razorpayOrderId,
    } = req.body;

    if (
      !vehicle_id ||
      !pickUpDate ||
      !dropOffDate ||
      !pickUpLocation ||
      !dropOffLocation ||
      !razorpayPaymentId ||
      !razorpayOrderId
    ) {
      return next(errorHandler(400, "Missing required booking fields"));
    }

    const bookingWindow = parseBookingWindow(pickUpDate, dropOffDate);

    if (bookingWindow.error) {
      return next(errorHandler(400, bookingWindow.error));
    }

    const existingBooking = await Booking.findOne({
      $or: [
        { razorPayOrderId: razorpayOrderId },
        { razorPayPaymentId: razorpayPaymentId },
      ],
    });

    if (existingBooking) {
      return next(
        errorHandler(409, "A booking already exists for this payment"),
      );
    }

    const availableVehicles = await availableAtDate(
      bookingWindow.pickUp,
      bookingWindow.bufferedDropOff,
    );

    const isAvailable = availableVehicles.some(
      (vehicle) => vehicle._id.toString() === vehicle_id,
    );

    if (!isAvailable) {
      return next(
        errorHandler(409, "Vehicle is not available for the selected period"),
      );
    }

    const vehicle = await Vehicle.findOne({
      _id: vehicle_id,
      isDeleted: false,
      isApproved: true,
      isRejected: false,
    });

    if (!vehicle) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    const billableDays = calculateBillableDays(
      bookingWindow.pickUp,
      bookingWindow.dropOff,
    );
    const totalPrice = billableDays * vehicle.price;

    const booking = new Booking({
      vehicleId: vehicle_id,
      userId: req.user,
      pickUpDate: bookingWindow.pickUp,
      dropOffDate: bookingWindow.dropOff,
      pickUpLocation: pickUpLocation.trim(),
      dropOffLocation: dropOffLocation.trim(),
      totalPrice,
      razorPayOrderId: razorpayOrderId,
      razorPayPaymentId: razorpayPaymentId,
      status: "BOOKED",
    });

    const savedBooking = await booking.save();

    const user = req.currentUser || (await User.findById(req.user));

    const bookingDetails = {
      bookingId: savedBooking._id,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      startDate: savedBooking.pickUpDate,
      endDate: savedBooking.dropOffDate,
      totalAmount: savedBooking.totalPrice
    };

    if (user?.email) {
      sendBookingConfirmation(user.email, bookingDetails).catch((error) => {
        console.error("User booking email error:", error);
      });
    }

    const vendor = await User.findById(vehicle.addedBy);
    if (vendor?.email) {
      sendVendorBookingAlert(vendor.email, bookingDetails).catch((error) => {
        console.error("Vendor alert email error:", error);
      });
    }

    await notifyUsers({
      recipientIds: [req.user, vehicle.addedBy],
      type: "BOOKING_CONFIRMED",
      title: "Booking confirmed",
      message: `Booking ${savedBooking._id} for ${vehicle.brand} ${vehicle.model} has been confirmed.`,
      relatedEntityType: "booking",
      relatedEntityId: savedBooking._id,
      metadata: {
        bookingId: savedBooking._id,
        vehicleId: vehicle._id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Car booked successfully",
      booking: savedBooking,
      pricing: {
        billableDays,
        vehicleDailyPrice: vehicle.price,
        totalPrice,
      },
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Error while booking car"));
  }
};

export const razorpayOrder = async (req, res, next) => {
  try {
    const { vehicle_id, pickUpDate, dropOffDate, pickUpLocation, dropOffLocation } = req.body;

    if (!vehicle_id || !pickUpDate || !dropOffDate || !pickUpLocation || !dropOffLocation) {
      return next(
        errorHandler(
          400,
          "vehicle_id, pickUpDate and dropOffDate are required",
        ),
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return next(errorHandler(500, "Razorpay keys are not configured"));
    }

    const vehicle = await Vehicle.findOne({
      _id: vehicle_id,
      isDeleted: false,
      isApproved: true,
      isRejected: false,
    });

    if (!vehicle) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    const bookingWindow = parseBookingWindow(pickUpDate, dropOffDate);

    if (bookingWindow.error) {
      return next(errorHandler(400, bookingWindow.error));
    }

    const billableDays = calculateBillableDays(
      bookingWindow.pickUp,
      bookingWindow.dropOff,
    );
    const totalPrice = billableDays * vehicle.price;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: totalPrice * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        vehicleId: vehicle._id.toString(),
        userId: req.user,
        pickUpDate: bookingWindow.pickUp.toISOString(),
        dropOffDate: bookingWindow.dropOff.toISOString(),
        pickUpLocation: pickUpLocation,
        dropOffLocation: dropOffLocation,
      },
    });

    return res.status(200).json({
      success: true,
      order,
      pricing: {
        billableDays,
        vehicleDailyPrice: vehicle.price,
        totalPrice,
      },
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Error creating Razorpay order"));
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(
        errorHandler(400, "Payment verification fields are required"),
      );
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(errorHandler(400, "Payment verification failed"));
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    return next(errorHandler(500, "Payment verification error"));
  }
};

export const getAvailableVehicles = async (req, res, next) => {
  try {
    const { pickUpDate, dropOffDate, district, location } = req.body;

    if (!pickUpDate || !dropOffDate || !district || !location) {
      return next(errorHandler(400, "Missing required fields"));
    }

    const bookingWindow = parseBookingWindow(pickUpDate, dropOffDate);

    if (bookingWindow.error) {
      return next(errorHandler(400, bookingWindow.error));
    }

    const vehicles = await availableAtDate(
      bookingWindow.pickUp,
      bookingWindow.bufferedDropOff,
    );

    const normalizedDistrict = district.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();

    const filteredVehicles = vehicles.filter(
      (vehicle) =>
        vehicle.district?.toLowerCase() === normalizedDistrict &&
        vehicle.location?.toLowerCase() === normalizedLocation,
    );

    return res.status(200).json({
      success: true,
      count: filteredVehicles.length,
      vehicles: filteredVehicles,
    });
  } catch (error) {
    return next(errorHandler(500, "Error fetching vehicles"));
  }
};

export const findBookingsOfUser = async (req, res, next) => {
  try {
    const bookings = await Booking.aggregate(
      buildBookingAggregation({
        userId: new mongoose.Types.ObjectId(req.user),
      }),
    );

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return next(errorHandler(500, "Error fetching bookings"));
  }
};

export const latestBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.aggregate(
      buildBookingAggregation({
        userId: new mongoose.Types.ObjectId(req.user),
      }).concat([{ $limit: 5 }]),
    );

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return next(errorHandler(500, "Error fetching latest bookings"));
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId || req.body.bookingId;

    if (!bookingId) {
      return next(errorHandler(400, "bookingId is required"));
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user,
    });

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    if (!["BOOKED", "NOT_PICKED"].includes(booking.status)) {
      return next(errorHandler(400, "This booking cannot be canceled now"));
    }

    booking.status = "CANCELED";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking canceled successfully",
      booking,
    });
  } catch (error) {
    return next(errorHandler(500, "Error canceling booking"));
  }
};

export const sendBookingDetailsEmail = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId || req.body.bookingId;

    if (!bookingId) {
      return next(errorHandler(400, "bookingId is required"));
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user,
    });

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    const [user, vehicle] = await Promise.all([
      req.currentUser
        ? Promise.resolve(req.currentUser)
        : User.findById(req.user),
      Vehicle.findById(booking.vehicleId),
    ]);

    if (!user?.email) {
      return next(errorHandler(400, "User email is not available"));
    }

    if (!vehicle) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    const bookingDetails = {
      bookingId: booking._id,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      startDate: booking.pickUpDate,
      endDate: booking.dropOffDate,
      totalAmount: booking.totalPrice
    };

    await sendBookingConfirmation(user.email, bookingDetails);

    return res.status(200).json({
      success: true,
      message: "Booking email sent successfully",
    });
  } catch (error) {
    return next(errorHandler(500, "Error sending booking email"));
  }
};

export const BookCar = bookCar;
export const latestbookings = latestBookings;
export const sendBookingDetailsEamil = sendBookingDetailsEmail;

export const razorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Webhook Error: RAZORPAY_WEBHOOK_SECRET not configured");
      return res.status(500).json({ success: false, message: "Webhook secret missing" });
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ success: false, message: "Missing signature" });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Parse the raw body
    const event = JSON.parse(req.body.toString());

    // Only process order.paid
    if (event.event === "order.paid") {
      const order = event.payload.order.entity;
      const payment = event.payload.payment.entity;
      const notes = order.notes;

      if (!notes || !notes.vehicleId || !notes.userId) {
        return res.status(200).json({ success: true, message: "No notes found, ignoring" });
      }

      // Check if booking already exists (from frontend calling bookCar first)
      const existingBooking = await Booking.findOne({
        $or: [
          { razorPayOrderId: order.id },
          { razorPayPaymentId: payment.id },
        ],
      });

      if (existingBooking) {
        return res.status(200).json({ success: true, message: "Booking already handled" });
      }

      const vehicle = await Vehicle.findById(notes.vehicleId);
      if (!vehicle) {
        return res.status(200).json({ success: true, message: "Vehicle not found" });
      }

      const pickUp = new Date(notes.pickUpDate);
      const dropOff = new Date(notes.dropOffDate);
      const billableDays = calculateBillableDays(pickUp, dropOff);
      const totalPrice = billableDays * vehicle.price;

      // Create booking
      const booking = new Booking({
        vehicleId: vehicle._id,
        userId: notes.userId,
        pickUpDate: pickUp,
        dropOffDate: dropOff,
        pickUpLocation: notes.pickUpLocation || vehicle.location,
        dropOffLocation: notes.dropOffLocation || vehicle.location,
        totalPrice: totalPrice,
        razorPayOrderId: order.id,
        razorPayPaymentId: payment.id,
        status: "BOOKED",
      });

      const savedBooking = await booking.save();

      // Notifications
      const user = await User.findById(notes.userId);
      const bookingDetails = {
        bookingId: savedBooking._id,
        vehicleName: `${vehicle.brand} ${vehicle.model}`,
        startDate: savedBooking.pickUpDate,
        endDate: savedBooking.dropOffDate,
        totalAmount: savedBooking.totalPrice
      };

      if (user?.email) {
        sendBookingConfirmation(user.email, bookingDetails).catch((err) => {
          console.error("Webhook User email error:", err);
        });
      }

      const vendor = await User.findById(vehicle.addedBy);
      if (vendor?.email) {
        sendVendorBookingAlert(vendor.email, bookingDetails).catch((err) => {
          console.error("Webhook Vendor email error:", err);
        });
      }

      await notifyUsers({
        recipientIds: [notes.userId, vehicle.addedBy],
        type: "BOOKING_CONFIRMED",
        title: "Booking confirmed",
        message: `Booking ${savedBooking._id} for ${vehicle.brand} ${vehicle.model} has been confirmed.`,
        relatedEntityType: "booking",
        relatedEntityId: savedBooking._id,
        metadata: {
          bookingId: savedBooking._id,
          vehicleId: vehicle._id,
        },
      });

      return res.status(200).json({ success: true, message: "Booking created via webhook" });
    }

    return res.status(200).json({ success: true, message: "Unhandled event type" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ success: false, message: "Webhook processing error" });
  }
};
