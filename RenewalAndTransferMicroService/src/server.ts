import express from "express";
import "colors";
import { connectDB, disconnectDB } from "./database/methods";
import routeIndex from "./routes/index";
import errorHandler from "./middlewares/errorMiddleware";
import eurekaClient from "./integrations/eureka/eurekaClient";
import client from "prom-client";
import logger from "./logging/index";
import loggerMiddleware from "./middlewares/loggerMiddleware";

const app = express();
const PORT = process.env.PORT;

// Setup parsing middlewares
// app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Setup logger middleware
app.use(loggerMiddleware);

// Setup routes
app.use("/api", routeIndex);

// Setup error handler middlewares
app.use(errorHandler);

// Connect Database
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(
    `${process.env.SERVICE_NAME} listening successfully on port ${process.env.PORT}`
  );
  logger.info(
    `${process.env.SERVICE_NAME} listening successfully on port ${process.env.PORT}`
  );
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

// Register with eureka service registry
eurekaClient.start((error: unknown) => {
  if (error) {
    console.log("❌❌❌ Eureka registration failed(1):", error);
  } else {
    console.log("✅✅✅ Application registered with Eureka!");
    logger.info(
      `✅✅✅ Application successfully registered with eureka service registry.`
    );
  }
});

// On registration failure, register after an interval
let numOfTries: number = 1;
const intId = setInterval(() => {
  eurekaClient.start((error: unknown) => {
    if (error) {
      if ((numOfTries += 1) % 10 === 0) {
        logger.error(
          `❌❌❌ Application failed to register with eureka service registry.`,
          {
            error: error,
            numOfTries: numOfTries,
            registrationDelay: `${numOfTries * 10}s`,
          }
        );
      }
      console.log(`❌❌❌ Eureka registration failed(${numOfTries}):`, error);
    } else {
      console.log("✅✅✅ Applicaation registered with Eureka!");
      logger.info(
        `✅✅✅ Application successfully registered with eureka service registry.`
      );
      clearInterval(intId);
    }
  });
}, 60000);

// Deregistering from eureka service reg
process.on("SIGINT", () => eurekaClient.stop());

// Setup database disconnect on exit
process.on("SIGINT", disconnectDB);
