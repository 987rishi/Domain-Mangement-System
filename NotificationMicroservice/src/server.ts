import app from "./app";
import { config } from "./config";
import prisma from "./config/database.config";
import { eurekaClient } from "./utils/serviceDiscovery";
const PORT = config.port;
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("connected to database successfully 🚀");
  } catch (error) {
    console.error("database connection failed ", error);
    process.exit(1);
  }
};
const connectServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
  } catch {
    console.error("server connection failed");
  }
};
connectServer();
eurekaClient.start((error: unknown) => {
  if (error) {
    console.log("❌ Eureka registration failed:", error);
  } else {
    console.log("✅ Registered with Eureka!");
  }
});