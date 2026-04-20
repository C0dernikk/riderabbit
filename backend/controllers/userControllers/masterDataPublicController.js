import MasterData from "../../models/masterDataModel.js";
import { errorHandler } from "../../utils/error.js";

/**
 * Public read-only list for booking UI (districts, locations, car rows).
 * Same document shape the legacy `/api/admin/getVehicleModels` client expected.
 */
export const listMasterDataForPublic = async (req, res, next) => {
  try {
    const rows = await MasterData.find()
      .sort({ type: 1, district: 1, location: 1, brand: 1, model: 1 })
      .lean();

    return res.status(200).json(rows);
  } catch (error) {
    return next(errorHandler(500, "Error fetching master data"));
  }
};
