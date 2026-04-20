import Vehicle from "../../models/vehicleModel.js";
import { notifyUsers } from "../../services/notificationService.js";
import { errorHandler } from "../../utils/error.js";

export const fetchVendorVehicleRequests = async (req, res, next) => {
  try {
    const vendorRequests = await Vehicle.find({
      isApproved: false,
      isRejected: false,
      isDeleted: false,
      addedBy: { $ne: null },
    })
      .populate({
        path: "addedBy",
        select: "username email role",
      })
      .sort({ createdAt: -1 });

    const filteredRequests = vendorRequests.filter(
      (vehicle) => vehicle.addedBy?.role === "vendor"
    );

    return res.status(200).json({
      success: true,
      count: filteredRequests.length,
      requests: filteredRequests,
    });
  } catch (error) {
    console.log(error);
    return next(errorHandler(500, "Error fetching vendor requests"));
  }
};

export const approveVendorVehicleRequest = async (req, res, next) => {
  try {
    const vehicleId = req.body.vehicleId || req.params.vehicleId;

    if (!vehicleId) {
      return next(errorHandler(400, "Vehicle ID is required"));
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        isApproved: true,
        isRejected: false,
      },
      { new: true, runValidators: true }
    ).populate("addedBy", "username role");

    if (!vehicle) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    await notifyUsers({
      recipientIds: [vehicle.addedBy?._id],
      type: "VENDOR_VEHICLE_APPROVED",
      title: "Vehicle approved",
      message: `${vehicle.brand} ${vehicle.model} has been approved by admin.`,
      relatedEntityType: "vehicle",
      relatedEntityId: vehicle._id,
      metadata: {
        vehicleId: vehicle._id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle approved successfully",
      vehicle,
    });
  } catch (error) {
    return next(errorHandler(500, "Error approving vehicle"));
  }
};

export const rejectVendorVehicleRequest = async (req, res, next) => {
  try {
    const vehicleId = req.body.vehicleId || req.params.vehicleId;

    if (!vehicleId) {
      return next(errorHandler(400, "Vehicle ID is required"));
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        isApproved: false,
        isRejected: true,
      },
      { new: true, runValidators: true }
    ).populate("addedBy", "username role");

    if (!vehicle) {
      return next(errorHandler(404, "Vehicle not found"));
    }

    await notifyUsers({
      recipientIds: [vehicle.addedBy?._id],
      type: "VENDOR_VEHICLE_REJECTED",
      title: "Vehicle rejected",
      message: `${vehicle.brand} ${vehicle.model} has been rejected by admin.`,
      relatedEntityType: "vehicle",
      relatedEntityId: vehicle._id,
      metadata: {
        vehicleId: vehicle._id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle rejected successfully",
      vehicle,
    });
  } catch (error) {
    return next(errorHandler(500, "Error rejecting vehicle"));
  }
};
