import mongoose from "mongoose";

const masterDataSchema = new mongoose.Schema(
  {
    // Type discriminator
    type: {
      type: String,
      enum: ["location", "car"],
      required: true,
    },

    // Location fields
    district: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },

    // Car fields
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    variant: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// 🔐 Conditional validation
masterDataSchema.pre("validate", function () {
  if (this.type === "location") {
    if (!this.district || !this.location) {
      throw new Error("For type 'location', district and location are required");
    }
  }

  if (this.type === "car") {
    if (!this.brand || !this.model || !this.variant) {
      throw new Error("For type 'car', brand, model and variant are required");
    }
  }
});


export default mongoose.model("MasterData", masterDataSchema);