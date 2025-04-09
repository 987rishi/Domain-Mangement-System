import app from "./app.js";
import { config } from "./config/index.config.js";
import prisma from "./config/database.config.js";
const PORT = config.port;
import { eurekaClient  } from "./utils/serviceDiscovery.js";
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
    app.listen(PORT,"0.0.0.0", () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
  } catch {
    console.error("server connection failed");
  }
};
connectServer();
// Connect to Eureka
eurekaClient.start((error: unknown) => {
  if (error) {
    console.log("❌ Eureka registration failed:", error);
  } else {
    console.log("✅ Registered with Eureka!");
  }
});
