import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT || 5001,
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/default_log_db",
};

if (!config.mongoURI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1);
}

export default config;
