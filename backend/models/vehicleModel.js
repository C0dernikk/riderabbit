import mongoose from "mongoose";

const documentNotificationSchema = new mongoose.Schema(
  {
    insuranceEnd: Date,
    registrationEnd: Date,
    pollutionEnd: Date,
  },
  { _id: false }
);

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    yearMade: {
      type: Number,
      min: 1990,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid"],
    },
    seats: {
      type: Number,
      min: 1,
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    basePackage: {
      type: String,
      trim: true,
    },
    withOrWithoutFuel: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    insuranceEnd: Date,
    registrationEnd: Date,
    pollutionEnd: Date,
    documentNotificationMeta: {
      type: documentNotificationSchema,
      default: () => ({}),
    },
    certification: {
      fitness: String,
      registration: String,
      rc: String,
      pollution: String,
    },
    carType: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    locationPoint: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [76.2711, 10.8505]
      }
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ addedBy: 1, isDeleted: 1, createdAt: -1 });
vehicleSchema.index({ isApproved: 1, isDeleted: 1, district: 1, location: 1 });
vehicleSchema.index({ locationPoint: "2dsphere" });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
