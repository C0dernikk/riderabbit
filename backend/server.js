import "./config/env.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { buildMongoUri } from "./config/database.js";
import { initSocket } from "./socket.js";
import adminRoute from "./routes/adminRoute.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import vendorRoute from "./routes/vendorRoute.js";
import contactRoute from "./routes/contactRoute.js";
import newsletterRoute from "./routes/newsletterRoute.js";
import messageRoute from "./routes/messageRoute.js";
import {
  notifyExpiringVehicleDocuments,
  updateOverdueBookings,
} from "./services/cronJobs.js";

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 3000;
const mongoUri = buildMongoUri();
const allowedOrigins = (
  process.env.CLIENT_URLS || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174/"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Initialize Socket.io
initSocket(httpServer, allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || 
        allowedOrigins.includes(origin) || 
        allowedOrigins.includes(origin + "/") ||
        origin.startsWith("http://localhost") || 
        origin.startsWith("http://127.0.0.1")
      ) {
        callback(null, true);
      } else {
        console.error("CORS Blocked for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Must use raw body for Razorpay webhook signature verification
app.use("/api/user/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RideRabit backend is healthy",
  });
});

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/vendor", vendorRoute);
app.use("/api/contact", contactRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/messages", messageRoute);

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER CAUGHT:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

const startBackgroundSchedulers = () => {
  const oneHourInMs = 60 * 60 * 1000;

  const runScheduledTasks = async () => {
    await updateOverdueBookings();
    await notifyExpiringVehicleDocuments();
  };

  runScheduledTasks().catch((error) => {
    console.error("Initial scheduled tasks failed:", error);
  });

  setInterval(() => {
    runScheduledTasks().catch((error) => {
      console.error("Scheduled tasks failed:", error);
    });
  }, oneHourInMs);
};

const startServer = async () => {
  try {
    if (!mongoUri) {
      throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    startBackgroundSchedulers();

    httpServer.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
