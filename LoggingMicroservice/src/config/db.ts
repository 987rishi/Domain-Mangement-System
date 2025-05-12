// src/config/db.ts
import mongoose from "mongoose";
import config from "./index";

const connectDB = async () => {
  try {
    console.log("⚒️ MongoDB connection initiated...");
    await mongoose.connect(config.mongoURI);
    console.log("✅ MongoDB connection successful...");
  } catch (err: any) {
    console.error("❌MongoDB connection unsuccessful...:", err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
