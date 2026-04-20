import mongoose from "mongoose";
import dotenv from "dotenv";
import Vehicle from "./models/vehicleModel.js";
import User from "./models/userModel.js";
import Booking from "./models/bookingModel.js";
import Review from "./models/reviewModel.js";
import { completePickup, startTrip, endTrip, completeReturnInspection } from "./controllers/vendorControllers/vendorBookingsController.js";
import { createBookingReview } from "./controllers/userControllers/userReviewController.js";
import { allBookings as adminGetBookings } from "./controllers/adminControllers/bookingsController.js";

dotenv.config();

const mockReqRes = (userId, bodyData, paramsData = {}) => {
  let errorOccurred = null;
  const req = {
    user: userId,
    body: bodyData,
    params: paramsData
  };
  const res = {
    status: function (code) { this.statusCode = code; return this; },
    json: function (data) { this.data = data; return this; }
  };
  const next = (err) => { errorOccurred = err; };
  return { req, res, next, getError: () => errorOccurred };
};

async function runFullE2ELifecycle() {
  try {
    console.log("-----------------------------------------");
    console.log("🚀 STARTING E2E LIFECYCLE TEST");
    console.log("-----------------------------------------");
    await mongoose.connect(process.env.MONGO_URI + process.env.DB_NAME);

    // 1. Find a recently created booking (like the one from our previous test)
    const activeBooking = await Booking.findOne({ status: "BOOKED" }).sort({ createdAt: -1 });
    if (!activeBooking) throw new Error("No active booking found to test.");
    
    const vehicle = await Vehicle.findById(activeBooking.vehicleId);
    const vendorId = vehicle.addedBy.toString();
    const userId = activeBooking.userId.toString();
    
    console.log(`[INIT] Found Booking ID: ${activeBooking._id}`);
    console.log(`[INIT] Vehicle: ${vehicle.brand} ${vehicle.model} | Vendor ID: ${vendorId}`);

    // ==========================================
    // PHASE 1: VENDOR DASHBOARD OPERATIONS
    // ==========================================
    console.log("\n--- PHASE 1: VENDOR FULFILLS BOOKING ---");
    
    const runVendorOp = async (fn, name) => {
        const { req, res, next, getError } = mockReqRes(vendorId, {}, { bookingId: activeBooking._id });
        await fn(req, res, next);
        if (getError()) throw new Error(`${name} failed: ${getError().message}`);
        if (!res.data.success) throw new Error(`${name} rejected: ${res.data.message}`);
        console.log(`✅ ${name} completed successfully.`);
    };

    await runVendorOp(completePickup, "completePickup");
    await runVendorOp(startTrip, "startTrip");
    await runVendorOp(endTrip, "endTrip");
    await runVendorOp(completeReturnInspection, "completeReturnInspection");

    // ==========================================
    // PHASE 2: USER REVIEWS THE VEHICLE
    // ==========================================
    console.log("\n--- PHASE 2: USER SUBMITS REVIEW ---");
    const reviewData = {
      rating: 5,
      comment: "Absolutely fantastic ride! Highly recommend this vendor."
    };
    
    const { req: reqReview, res: resReview, next: nextReview, getError: getErrorReview } = mockReqRes(
      userId, 
      reviewData, 
      { bookingId: activeBooking._id }
    );
    await createBookingReview(reqReview, resReview, nextReview);
    
    if (getErrorReview()) throw new Error(`Failed to create review: ${getErrorReview().message}`);
    console.log("✅ Review successfully created!");
    console.log(`User Rating Submitted: ${resReview.data.review.rating} Stars`);
    
    // Verify Vehicle Rating Updated
    const updatedVehicle = await Vehicle.findById(vehicle._id);
    console.log(`✅ Vehicle Total Rating is now: ${updatedVehicle.rating} (Total Reviews: ${updatedVehicle.totalReviews})`);

    // ==========================================
    // PHASE 3: ADMIN VERIFICATION
    // ==========================================
    console.log("\n--- PHASE 3: ADMIN DASHBOARD DATA FETCH ---");
    const adminUser = await User.findOne({ role: "admin" });
    const { req: reqAdmin, res: resAdmin, next: nextAdmin, getError: getErrorAdmin } = mockReqRes(adminUser._id.toString(), {});
    await adminGetBookings(reqAdmin, resAdmin, nextAdmin);
    
    if (getErrorAdmin()) throw new Error(`Admin fetch failed: ${getErrorAdmin().message}`);
    
    const adminBookingRecord = resAdmin.data.bookings.find(b => b._id.toString() === activeBooking._id.toString());
    if (adminBookingRecord) {
       console.log(`✅ Admin successfully retrieved the booking.`);
       console.log(`Admin Record Status: ${adminBookingRecord.status} | Total Price: ₹${adminBookingRecord.totalPrice}`);
    } else {
       throw new Error("Admin could not find the booking in the global list!");
    }

    console.log("\n-----------------------------------------");
    console.log("🎉 ALL E2E LIFECYCLE TESTS PASSED SUCCESSFULLY!");
    console.log("-----------------------------------------");

  } catch (error) {
    console.error("\n❌ E2E TEST FAILED:", error);
  } finally {
    await mongoose.disconnect();
  }
}

runFullE2ELifecycle();
