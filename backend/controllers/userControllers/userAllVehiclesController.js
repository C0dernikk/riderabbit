import Vehicle from "../../models/vehicleModel.js";
import { availableAtDate } from "../../services/checkAvailableVehicle.js";
import { errorHandler } from "../../utils/error.js";

const parseBookingWindow = (pickUpDate, dropOffDate) => {
  const pickUp = new Date(pickUpDate);
  const dropOff = new Date(dropOffDate);

  if (Number.isNaN(pickUp.getTime()) || Number.isNaN(dropOff.getTime())) {
    return { error: "Invalid booking dates" };
  }

  if (pickUp >= dropOff) {
    return { error: "dropOffDate must be after pickUpDate" };
  }

  const bufferedDropOff = new Date(dropOff);
  bufferedDropOff.setHours(bufferedDropOff.getHours() + 3);

  return { pickUp, dropOff, bufferedDropOff };
};

export const listAllVehicles = async (req, res, next) => {
  try {
    const now = new Date();
    const vehicles = await availableAtDate(now, now);

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    return next(
      errorHandler(500, "Something went wrong while fetching vehicles"),
    );
  }
};

export const showVehicleDetails = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      isDeleted: false,
      isApproved: true,
      isRejected: false,
    });

    if (!vehicle) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    return res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    return next(
      errorHandler(500, "Something went wrong while fetching vehicle details"),
    );
  }
};

export const checkAvailability = async (req, res, next) => {
  try {
    const { pickUpDate, dropOffDate, vehicleId } = req.body || {};

    if (!pickUpDate || !dropOffDate || !vehicleId) {
      return next(
        errorHandler(400, "pickUpDate, dropOffDate and vehicleId are required"),
      );
    }

    const bookingWindow = parseBookingWindow(pickUpDate, dropOffDate);

    if (bookingWindow.error) {
      return next(errorHandler(400, bookingWindow.error));
    }

    const availableVehicles = await availableAtDate(
      bookingWindow.pickUp,
      bookingWindow.bufferedDropOff,
    );

    const isAvailable = availableVehicles.some(
      (vehicle) => vehicle._id.toString() === vehicleId,
    );

    return res.status(200).json({
      success: true,
      available: isAvailable,
      message: isAvailable
        ? "Vehicle is available for the selected period"
        : "Vehicle is not available for the selected period",
    });
  } catch (error) {
    return next(errorHandler(500, "Error checking vehicle availability"));
  }
};

export const searchCar = async (req, res, next) => {
  try {
    const {
      pickup_district,
      pickup_location,
      dropoff_location,
      pickUpDate,
      dropOffDate,
    } = req.body || {};

    if (!pickup_district || !pickup_location || !pickUpDate || !dropOffDate) {
      return next(errorHandler(400, "Missing required search fields"));
    }

    const bookingWindow = parseBookingWindow(pickUpDate, dropOffDate);

    if (bookingWindow.error) {
      return next(errorHandler(400, bookingWindow.error));
    }

    const availableVehicles = await availableAtDate(
      bookingWindow.pickUp,
      bookingWindow.bufferedDropOff,
    );

    const normalizedDistrict = pickup_district.trim().toLowerCase();
    const normalizedPickupLocation = pickup_location.trim().toLowerCase();
    const normalizedDropLocation = dropoff_location?.trim().toLowerCase();

    const filteredVehicles = availableVehicles.filter((vehicle) => {
      const districtMatch =
        vehicle.district?.toLowerCase() === normalizedDistrict;
      const pickupMatch =
        vehicle.location?.toLowerCase() === normalizedPickupLocation;
      const dropMatch = normalizedDropLocation
        ? vehicle.location?.toLowerCase() === normalizedDropLocation
        : true;

      return districtMatch && pickupMatch && dropMatch;
    });

    const uniqueVehicles = Object.values(
      filteredVehicles.reduce((accumulator, vehicle) => {
        const key = [
          vehicle.brand,
          vehicle.model,
          vehicle.fuelType,
          vehicle.transmission,
          vehicle.seats,
          vehicle.location,
        ].join("-");

        if (!accumulator[key]) {
          accumulator[key] = vehicle;
        }

        return accumulator;
      }, {}),
    );

    return res.status(200).json({
      success: true,
      count: uniqueVehicles.length,
      vehicles: uniqueVehicles,
    });
  } catch (error) {
    return next(errorHandler(500, "Error while searching cars"));
  }
};

export const searchCarsNearMe = async (req, res, next) => {
  try {
    const { lat, lng, radiusInKm = 50, pickUpDate, dropOffDate } = req.body || {};

    if (!lat || !lng || !pickUpDate || !dropOffDate) {
      return next(errorHandler(400, "Missing required geospatial search fields"));
    }

    const bookingWindow = parseBookingWindow(pickUpDate, dropOffDate);
    if (bookingWindow.error) {
      return next(errorHandler(400, bookingWindow.error));
    }

    const availableVehicles = await availableAtDate(
      bookingWindow.pickUp,
      bookingWindow.bufferedDropOff,
    );
    const availableIds = availableVehicles.map(v => v._id.toString());

    const nearbyVehicles = await Vehicle.find({
      _id: { $in: availableIds },
      locationPoint: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radiusInKm) * 1000 
        }
      }
    });

    const uniqueVehicles = Object.values(
      nearbyVehicles.reduce((accumulator, vehicle) => {
        const key = [
          vehicle.brand,
          vehicle.model,
          vehicle.fuelType,
          vehicle.transmission,
          vehicle.seats,
          vehicle.location,
        ].join("-");

        if (!accumulator[key]) {
          accumulator[key] = vehicle;
        }

        return accumulator;
      }, {}),
    );

    return res.status(200).json({
      success: true,
      count: uniqueVehicles.length,
      vehicles: uniqueVehicles,
    });
  } catch (error) {
    return next(errorHandler(500, "Error while searching nearby cars"));
  }
};
