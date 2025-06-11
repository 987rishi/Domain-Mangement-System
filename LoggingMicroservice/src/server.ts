import app from "./app";
import config from "./config";
import connectDB from "./config/db";
import { registerMicroService } from "./config/serviceRegistry";
import client from "prom-client";
import { initializeLogArchiverJob } from "./jobs/logArchiver.job";

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Logging service running on port ${PORT}`);
    console.log(`MongoDB URI: ${config.mongoURI}`);
    initializeLogArchiverJob();
  });

  /**
   * BELOW IS THE CONFIGURATION FOR PROMETHEUS SCRAPING OF METRICS
   * PLEASE DO NO TOUCH IT
   */
  const registry = new client.Registry();
  client.collectDefaultMetrics({ register: registry });

  //EXPOSING API FOR METRICS
  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", registry.contentType);
    res.end(await registry.metrics());
  });
  // -------------X-------------X-----------------------

  // Register with service registry
  await registerMicroService();
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
