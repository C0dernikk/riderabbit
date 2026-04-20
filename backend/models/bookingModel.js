import mongoose from "mongoose";

export const BOOKING_STATUSES = [
  "NOT_BOOKED",
  "BOOKED",
  "PICKED_UP",
  "ON_TRIP",
  "NOT_PICKED",
  "CANCELED",
  "OVERDUE",
  "TRIP_ENDED",
  "TRIP_COMPLETED",
];

const bookingCheckpointSchema = new mongoose.Schema(
  {
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    odometer: {
      type: Number,
      min: 0,
    },
    fuelLevel: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    checklist: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const returnInspectionSchema = new mongoose.Schema(
  {
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    odometer: {
      type: Number,
      min: 0,
    },
    fuelLevel: {
      type: String,
      trim: true,
    },
    damageReported: {
      type: Boolean,
      default: false,
    },
    damageNotes: {
      type: String,
      trim: true,
      default: "",
    },
    extraCharge: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    checklist: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickUpDate: {
      type: Date,
      required: true,
    },
    dropOffDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.pickUpDate || value > this.pickUpDate;
        },
        message: "dropOffDate must be later than pickUpDate",
      },
    },
    pickUpLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dropOffLocation: {
      type: String,
      required: true,
      trim: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    razorPayOrderId: {
      type: String,
      required: true,
      trim: true,
    },
    razorPayPaymentId: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "NOT_BOOKED",
    },
    pickupCheckpoint: {
      type: bookingCheckpointSchema,
      default: () => ({}),
    },
    tripStartCheckpoint: {
      type: bookingCheckpointSchema,
      default: () => ({}),
    },
    tripEndCheckpoint: {
      type: bookingCheckpointSchema,
      default: () => ({}),
    },
    returnInspection: {
      type: returnInspectionSchema,
      default: () => ({}),
    },
    overdueNotifiedAt: Date,
  }, 
  { timestamps: true }
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ vehicleId: 1, pickUpDate: 1, dropOffDate: 1 });
bookingSchema.index({ status: 1, dropOffDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
