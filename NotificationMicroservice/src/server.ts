import app from "./app";
import { config } from "./config";
import prisma from "./config/database.config";
import { eurekaClient } from "./utils/serviceDiscovery";
import client from 'prom-client';

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

// eurekaClient.start((error: unknown) => {
//   if (error) {
//     console.log("❌ Eureka registration failed:", error);
//   } else {
//     console.log("✅ Registered with Eureka!");
//   }
// });
// 
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