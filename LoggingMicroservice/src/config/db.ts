// src/config/db.ts
import mongoose from "mongoose";
import config from "./index";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log("MongoDB Connected...");
  } catch (err: any) {
    console.error("MongoDB Connection Error:", err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
