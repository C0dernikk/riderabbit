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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const now = new Date();
    const vehicles = await availableAtDate(now, now);

    const startIndex = (page - 1) * limit;
    const paginatedVehicles = vehicles.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      currentPage: page,
      totalPages: Math.ceil(vehicles.length / limit),
      vehicles: paginatedVehicles,
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
      model,
      page: reqPage,
      limit: reqLimit,
    } = req.body || {};

    const page = parseInt(reqPage) || parseInt(req.query.page) || 1;
    const limit = parseInt(reqLimit) || parseInt(req.query.limit) || 12;

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
      const vehicleDistrict = vehicle.district?.toLowerCase() || "";
      const vehicleLocation = vehicle.location?.toLowerCase() || "";

      // Relaxed location matching because search inputs can be full addresses
      const isGeoSearch = normalizedDistrict === "nearby" || normalizedPickupLocation === "your location";
      const districtMatch = isGeoSearch || normalizedDistrict.includes(vehicleDistrict) || vehicleDistrict.includes(normalizedDistrict);
      const pickupMatch = isGeoSearch || normalizedPickupLocation.includes(vehicleLocation) || vehicleLocation.includes(normalizedPickupLocation);
      
      const dropMatch = normalizedDropLocation && !isGeoSearch
        ? (normalizedDropLocation.includes(vehicleLocation) || vehicleLocation.includes(normalizedDropLocation))
        : true;

      // Match model strictly if provided
      const modelMatch = model ? vehicle.model?.toLowerCase() === model.toLowerCase() : true;

      return (districtMatch || pickupMatch) && dropMatch && modelMatch;
    });

    // If searching for variants of a specific model, do not group them. Return all variants!
    const resultVehicles = model ? filteredVehicles : Object.values(
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

    const startIndex = (page - 1) * limit;
    const paginatedVehicles = resultVehicles.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      success: true,
      count: resultVehicles.length,
      currentPage: page,
      totalPages: Math.ceil(resultVehicles.length / limit),
      vehicles: paginatedVehicles,
    });
  } catch (error) {
    return next(errorHandler(500, "Error while searching cars"));
  }
};

export const searchCarsNearMe = async (req, res, next) => {
  try {
    const { lat, lng, radiusInKm = 50, pickUpDate, dropOffDate, page: reqPage, limit: reqLimit } = req.body || {};

    const page = parseInt(reqPage) || parseInt(req.query.page) || 1;
    const limit = parseInt(reqLimit) || parseInt(req.query.limit) || 12;

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

    const startIndex = (page - 1) * limit;
    const paginatedVehicles = uniqueVehicles.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      success: true,
      count: uniqueVehicles.length,
      currentPage: page,
      totalPages: Math.ceil(uniqueVehicles.length / limit),
      vehicles: paginatedVehicles,
    });
  } catch (error) {
    return next(errorHandler(500, "Error while searching nearby cars"));
  }
};
