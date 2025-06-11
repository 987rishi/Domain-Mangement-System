/**
 * @file This is the main entry point for the application.
 * It handles database connection, server initialization, and service registration with Eureka.
 */
import app from "./app";
import { config } from "./config";
import prisma from "./config/database.config";
import { eurekaClient } from "./utils/serviceDiscovery";
import client from "prom-client";

const PORT = config.port;
/**
 * Asynchronously connects to the Prisma database.
 * Logs a success message on connection or logs an error and exits the process on failure.
 * @returns {Promise<void>} A promise that resolves upon successful connection.
 */
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("connected to database successfully 🚀");
  } catch (error) {
    console.error("database connection failed ", error);
    process.exit(1);
  }
};
/**
 * Initializes and starts the Express server.
 * It first ensures the database is connected, then starts listening for requests on the configured port.
 * @returns {Promise<void>} A promise that resolves once the server is listening.
 */
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

/**
 * BELOW IS THE CONFIGURATION FOR PROMETHEUS SCRAPING OF METRICS
 * PLEASE DO NO TOUCH IT
 */
// const registry = new client.Registry();
// client.collectDefaultMetrics({ register:registry });

// //EXPOSING API FOR METRICS
// app.get('/metrics', async (req, res) => {
//     res.set('Content-Type', registry.contentType);
//     res.end(await registry.metrics());
// });
// -------------X-------------X-----------------------
/**
 * @section Service Discovery with Eureka
 * The following logic handles the registration of this service with the Eureka discovery server.
 */

eurekaClient.start((error: unknown) => {
  if (error) {
    console.log("❌ Eureka registration failed:", error);
  } else {
    console.log("✅ Registered with Eureka!");
  }
});
/**
 * A retry mechanism for Eureka registration. If the initial registration fails
 * (e.g., Eureka server is not yet available), this interval will attempt to
 * register again every 100 seconds until it succeeds.
 * @internal
 */
const intId = setInterval(() => {
  // Registering with eureka service reg
  eurekaClient.start((error: unknown) => {
    if (error) {
      console.log("❌ Eureka registration failed:", error);
    } else {
      console.log("✅ Registered with Eureka!");
      clearInterval(intId);
    }
  });
}, 100000);
