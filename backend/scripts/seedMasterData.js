import "../config/env.js";
import mongoose from "mongoose";
import { buildMongoUri } from "../config/database.js";
import { generateMasterData } from "../data/generateMasterData.js";
import MasterData from "../models/masterDataModel.js";

const mongoUri = buildMongoUri();

const seedMasterData = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Database connected");

    await MasterData.deleteMany();
    console.log("Existing master data cleared");

    const data = generateMasterData(1000);
    await MasterData.insertMany(data);
    console.log(`${data.length} records inserted`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedMasterData();
