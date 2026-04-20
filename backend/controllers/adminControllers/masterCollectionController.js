import { generateMasterData } from "../../data/generateMasterData.js";
import MasterData from "../../models/masterDataModel.js";
import { errorHandler } from "../../utils/error.js";

export const insertDummyData = async (req, res, next) => {
  try {
    const existingCount = await MasterData.countDocuments();

    if (existingCount > 0) {
      return res.status(200).json({
        success: true,
        message: "Master data already exists",
      });
    }

    const data = generateMasterData(1000);
    await MasterData.insertMany(data);

    return res.status(201).json({
      success: true,
      message: "Dummy data inserted",
    });
  } catch (error) {
    return next(errorHandler(500, "Error inserting data"));
  }
};

export const getCarModels = async (req, res, next) => {
  try {
    const cars = await MasterData.find({ type: "car" }).sort({
      brand: 1,
      model: 1,
      variant: 1,
    });

    return res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    return next(errorHandler(500, "Error fetching car models"));
  }
};

export const getLocations = async (req, res, next) => {
  try {
    const locations = await MasterData.find({ type: "location" }).sort({
      district: 1,
      location: 1,
    });

    return res.status(200).json({
      success: true,
      count: locations.length,
      locations,
    });
  } catch (error) {
    return next(errorHandler(500, "Error fetching locations"));
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const brands = await MasterData.distinct("brand", { type: "car" });

    return res.status(200).json({
      success: true,
      count: brands.length,
      brands: brands.filter(Boolean).sort(),
    });
  } catch (error) {
    return next(errorHandler(500, "Error fetching brands"));
  }
};
