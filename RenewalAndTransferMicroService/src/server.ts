import express from "express";
import "colors";
import cors from "cors";
import { connectDB, disconnectDB } from "./database/methods";
import routeIndex from "./routes/index";
import logger from "./middlewares/loggerMiddleware";
import errorHandler from "./middlewares/errorMiddleware";
import eurekaClient from "./integrations/eureka/eurekaClient";
import client from 'prom-client';

const app = express();
const PORT = process.env.PORT;

// Setup parsing middlewares
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup logger middleware
app.use(logger);

// Setup routes
app.use("/api", routeIndex);

// Setup error handler middlewares
app.use(errorHandler);

// Connect Database
connectDB();

// Start the server
app.listen(PORT, () =>
  console.log(`Server local: http://localhost:${PORT}`.cyan.bold)
);

/**
 * BELOW IS THE CONFIGURATION FOR PROMETHEUS SCRAPING OF METRICS
 * PLEASE DO NO TOUCH IT 
 */
const registry = new client.Registry();
client.collectDefaultMetrics({ register:registry });

//EXPOSING API FOR METRICS
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', registry.contentType);
    res.end(await registry.metrics());
});
// -------------X-------------X-----------------------


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

// eurekaClient.start((error: unknown) => {
//   if (error) {
//     console.log("❌ Eureka registration failed:", error);
//   } else {
//     console.log("✅ Registered with Eureka!");
//   }
// });

// Deregistering from eureka service reg
process.on("SIGINT", () => eurekaClient.stop());

// Setup database disconnect on exit
process.on("SIGINT", disconnectDB);

app.get("/api-gateway", (req, res) => {
  const service = eurekaClient.getInstancesByAppId("api-gateway")[0];
  const ips = fetch(`http://${service.ipAddr}:${service.port}`, {
    method: "GET",
  });

  res.send({ service, port: service.port });
  console.log(service);
});

app.get("/workflow-service", (req, res) => {
  const service = eurekaClient.getInstancesByAppId("workflow-service")[0];
  const ips = fetch(`http://${service.ipAddr}:${service.port}`, {
    method: "GET",
  });

  res.send({ service, port: service.port });
  console.log(service);
});

app.get("/user-management-service", (req, res) => {
  const service = eurekaClient.getInstancesByAppId(
    "user-management-service"
  )[0];
  const ips = fetch(`http://${service.ipAddr}:${service.port}`, {
    method: "GET",
  });

  res.send({ service, port: service.port });
  console.log(service);
});

app.get("/renewl-transfer-service", (req, res) => {
  const service = eurekaClient.getInstancesByAppId(
    "renewl-transfer-service"
  )[0];
  const ips = fetch(`http://${service.ipAddr}:${service.port}`, {
    method: "GET",
  });

  res.send({ service, port: service.port });
  console.log(service);
});


