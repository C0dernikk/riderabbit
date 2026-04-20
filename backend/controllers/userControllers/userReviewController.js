import mongoose from "mongoose";
import Booking from "../../models/bookingModel.js";
import Review from "../../models/reviewModel.js";
import Vehicle from "../../models/vehicleModel.js";
import { notifyUsers } from "../../services/notificationService.js";
import { errorHandler } from "../../utils/error.js";

const updateVehicleRatingSnapshot = async (vehicleId) => {
  const [stats] = await Review.aggregate([
    {
      $match: {
        vehicleId,
      },
    },
    {
      $group: {
        _id: "$vehicleId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await Vehicle.findByIdAndUpdate(
    vehicleId,
    {
      rating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
      totalReviews: stats?.totalReviews || 0,
    },
    { new: true }
  );
};

export const createBookingReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const bookingId = req.params.bookingId || req.body.bookingId;

    if (!bookingId) {
      return next(errorHandler(400, "bookingId is required"));
    }

    if (!rating) {
      return next(errorHandler(400, "rating is required"));
    }

    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return next(errorHandler(400, "rating must be an integer between 1 and 5"));
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user,
    }).populate({
      path: "vehicleId",
      select: "brand model addedBy",
    });

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    if (booking.status !== "TRIP_COMPLETED") {
      return next(
        errorHandler(400, "Reviews can only be submitted after the trip is completed")
      );
    }

    const existingReview = await Review.findOne({ bookingId });

    if (existingReview) {
      return next(errorHandler(409, "A review already exists for this booking"));
    }

    const review = await Review.create({
      bookingId,
      vehicleId: booking.vehicleId._id,
      userId: req.user,
      rating: numericRating,
      title: title?.trim() || "",
      comment: comment?.trim() || "",
    });

    await updateVehicleRatingSnapshot(booking.vehicleId._id);

    await notifyUsers({
      recipientIds: [booking.vehicleId.addedBy],
      type: "REVIEW_SUBMITTED",
      title: "New review received",
      message: `${booking.vehicleId.brand} ${booking.vehicleId.model} received a ${numericRating}-star review.`,
      relatedEntityType: "review",
      relatedEntityId: review._id,
      metadata: {
        bookingId: booking._id,
        vehicleId: booking.vehicleId._id,
        rating: numericRating,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    return next(errorHandler(500, "Error submitting review"));
  }
};

export const getVehicleReviews = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid vehicle ID"));
    }

    const vehicleObjectId = new mongoose.Types.ObjectId(req.params.id);

    const reviews = await Review.find({
      vehicleId: vehicleObjectId,
    })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });

    const [stats] = await Review.aggregate([
      {
        $match: {
          vehicleId: vehicleObjectId,
        },
      },
      {
        $group: {
          _id: "$vehicleId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
      totalReviews: stats?.totalReviews || 0,
      reviews,
    });
  } catch (error) {
    return next(errorHandler(500, "Error fetching reviews"));
  }
};
