import Booking from "../models/bookingModel.js";
import Vehicle from "../models/vehicleModel.js";

const ACTIVE_BOOKING_STATUSES = [
  "BOOKED",
  "PICKED_UP",
  "ON_TRIP",
  "OVERDUE",
  "NOT_PICKED",
];

export async function availableAtDate(pickUpDate, dropOffDate) {
  try {
    const conflictingBookings = await Booking.find({
      pickUpDate: { $lt: dropOffDate },
      dropOffDate: { $gt: pickUpDate },
      status: { $in: ACTIVE_BOOKING_STATUSES },
    }).select("vehicleId");

    const bookedVehicleIds = conflictingBookings.map((booking) => booking.vehicleId);

    return Vehicle.find({
      _id: { $nin: bookedVehicleIds },
      isDeleted: false,
      isApproved: true,
      isRejected: false,
      isAvailable: true,
    }).sort({ createdAt: -1 });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
