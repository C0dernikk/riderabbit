import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import Vehicle from "../models/vehicleModel.js";
import { notifyUsers } from "./notificationService.js";

const DOCUMENT_EXPIRY_WINDOW_DAYS = 7;

const isSameMoment = (firstDate, secondDate) => {
  if (!firstDate || !secondDate) {
    return false;
  }

  return new Date(firstDate).getTime() === new Date(secondDate).getTime();
};

export const updateOverdueBookings = async () => {
  try {
    const now = new Date();

    const overdueBookings = await Booking.find({
      dropOffDate: { $lt: now },
      status: { $in: ["PICKED_UP", "ON_TRIP"] },
    })
      .populate("userId", "username")
      .populate({
        path: "vehicleId",
        select: "brand model addedBy",
        populate: {
          path: "addedBy",
          select: "username role",
        },
      });

    for (const booking of overdueBookings) {
      booking.status = "OVERDUE";
      booking.overdueNotifiedAt = now;
      await booking.save({ validateBeforeSave: false });

      const vendorId = booking.vehicleId?.addedBy?._id;
      const vehicleLabel = `${booking.vehicleId?.brand || "Vehicle"} ${
        booking.vehicleId?.model || ""
      }`.trim();

      await notifyUsers({
        recipientIds: [booking.userId?._id, vendorId],
        type: "BOOKING_OVERDUE",
        title: "Booking overdue",
        message: `${vehicleLabel} booking ${booking._id} is overdue and needs return follow-up.`,
        relatedEntityType: "booking",
        relatedEntityId: booking._id,
        metadata: {
          bookingId: booking._id,
          vehicleId: booking.vehicleId?._id || null,
        },
      });
    }

    console.log(`Overdue booking check completed. Updated ${overdueBookings.length} booking(s).`);
  } catch (error) {
    console.log(error);
  }
};

export const notifyExpiringVehicleDocuments = async () => {
  try {
    const now = new Date();
    const thresholdDate = new Date(now);
    thresholdDate.setDate(thresholdDate.getDate() + DOCUMENT_EXPIRY_WINDOW_DAYS);

    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map((user) => user._id);

    const vehicles = await Vehicle.find({
      isDeleted: false,
      $or: [
        { insuranceEnd: { $lte: thresholdDate } },
        { registrationEnd: { $lte: thresholdDate } },
        { pollutionEnd: { $lte: thresholdDate } },
      ],
    }).populate("addedBy", "username role");

    for (const vehicle of vehicles) {
      const documents = [
        { field: "insuranceEnd", label: "Insurance" },
        { field: "registrationEnd", label: "Registration" },
        { field: "pollutionEnd", label: "Pollution certificate" },
      ];

      for (const document of documents) {
        const expiryDate = vehicle[document.field];

        if (!expiryDate || expiryDate > thresholdDate) {
          continue;
        }

        const alreadyNotified = isSameMoment(
          vehicle.documentNotificationMeta?.[document.field],
          expiryDate
        );

        if (alreadyNotified) {
          continue;
        }

        const dayDifference = Math.ceil(
          (new Date(expiryDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );
        const isExpired = dayDifference < 0;
        const title = isExpired
          ? `${document.label} expired`
          : `${document.label} expiring soon`;
        const message = isExpired
          ? `${document.label} for ${vehicle.brand} ${vehicle.model} has expired.`
          : `${document.label} for ${vehicle.brand} ${vehicle.model} expires in ${dayDifference} day(s).`;

        await notifyUsers({
          recipientIds: [vehicle.addedBy?._id, ...adminIds],
          type: "VEHICLE_DOCUMENT_EXPIRING",
          title,
          message,
          relatedEntityType: "vehicle",
          relatedEntityId: vehicle._id,
          metadata: {
            vehicleId: vehicle._id,
            documentType: document.field,
            expiryDate,
          },
        });

        vehicle.documentNotificationMeta[document.field] = expiryDate;
      }

      await vehicle.save({ validateBeforeSave: false });
    }

    console.log(
      `Document expiry notification check completed for ${vehicles.length} vehicle(s).`
    );
  } catch (error) {
    console.log(error);
  }
};
