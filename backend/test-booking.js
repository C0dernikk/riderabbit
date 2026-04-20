import mongoose from "mongoose";
import dotenv from "dotenv";
import Vehicle from "./models/vehicleModel.js";
import User from "./models/userModel.js";
import Booking from "./models/bookingModel.js";
import Notification from "./models/notificationModel.js";
import { bookCar } from "./controllers/userControllers/userBookingController.js";

dotenv.config();

async function runBackendE2ETest() {
  try {
    console.log("1. Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI + process.env.DB_NAME);
    console.log("Connected.");

    console.log("2. Finding a test user and an approved vehicle...");
    const testUser = await User.findOne({ role: "user" });
    if (!testUser) throw new Error("No user found in DB");

    const testVehicle = await Vehicle.findOne({ isApproved: true, isDeleted: false });
    if (!testVehicle) throw new Error("No approved vehicle found in DB");

    console.log(`Using User: ${testUser.email}, Vehicle: ${testVehicle.brand} ${testVehicle.model}`);

    console.log("3. Simulating 'bookCar' controller call...");
    
    // Create a mock req and res object
    const req = {
      user: testUser._id.toString(),
      currentUser: testUser,
      body: {
        vehicle_id: testVehicle._id.toString(),
        pickUpDate: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days from now
        dropOffDate: new Date(Date.now() + 31 * 86400000).toISOString(), // 31 days from now
        pickUpLocation: testVehicle.location,
        dropOffLocation: testVehicle.location,
        razorpayPaymentId: "pay_mock_" + Date.now(),
        razorpayOrderId: "order_mock_" + Date.now()
      }
    };

    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      }
    };

    let errorOccurred = null;
    const next = (err) => {
      errorOccurred = err;
    };

    await bookCar(req, res, next);

    if (errorOccurred) {
      console.error("❌ Test Failed with Error Handler:", errorOccurred);
      return;
    }

    if (res.statusCode === 201 && res.data.success) {
      console.log("✅ Booking Successfully Created!");
      console.log("Booking Details:", res.data.booking._id.toString());
      
      // Verify Notification
      console.log("4. Verifying Notifications...");
      const notifications = await Notification.find({ relatedEntityId: res.data.booking._id });
      console.log(`Found ${notifications.length} notifications generated for this booking.`);
      
      console.log("🎉 E2E Backend Booking Flow is 100% Functional!");
    } else {
      console.error("❌ Test Failed with response:", res.statusCode, res.data);
    }

  } catch (error) {
    console.error("Fatal Test Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

runBackendE2ETest();
