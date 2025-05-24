import app from "./app";
import config from "./config";
import connectDB from "./config/db";
import { registerMicroService } from "./config/serviceRegistry";

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Logging service running on port ${PORT}`);
    console.log(`MongoDB URI: ${config.mongoURI}`); // For verification
  });

  // Register with service registry
  await registerMicroService();
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
