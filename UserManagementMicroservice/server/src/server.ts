import app from "./app.js";
import { config } from "./config/index.config.js";
import prisma from "./config/database.config.js";
const PORT = config.port;
import { eurekaClient  } from "./utils/serviceDiscovery.js";
import  client  from 'prom-client';
/**
 * Establishes a connection to the database using Prisma.
 * Logs a success message upon successful connection.
 * If the connection fails, logs an error message and terminates the process.
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
 * Establishes a connection to the server using Express.
 * Logs a success message upon successful connection.
 * If the connection fails, logs an error message.
 */
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
/** 
 * Trying to connect with eureka 
*/

/*
  EXPOSING DEFAULT METRICS FOR PROMETHEUS SCRAPING
 */
const registry = new client.Registry();
client.collectDefaultMetrics({ register:registry });


// app.get('/metrics', async (req, res) => {
//     res.set('Content-Type', registry.contentType);
//     res.end(await registry.metrics());
// });


// eurekaClient.start((error: unknown) => {
//   if (error) {
//     console.log("❌ Eureka registration failed:", error);
//   } else {
//     console.log("✅ Registered with Eureka!");
//   }
// });
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