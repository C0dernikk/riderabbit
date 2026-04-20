import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "BOOKING_CONFIRMED",
  "BOOKING_OVERDUE",
  "VENDOR_VEHICLE_APPROVED",
  "VENDOR_VEHICLE_REJECTED",
  "VEHICLE_DOCUMENT_EXPIRING",
  "BOOKING_PICKUP_COMPLETED",
  "TRIP_STARTED",
  "TRIP_ENDED",
  "RETURN_INSPECTION_COMPLETED",
  "REVIEW_SUBMITTED",
];

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedEntityType: {
      type: String,
      trim: true,
      default: "",
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
