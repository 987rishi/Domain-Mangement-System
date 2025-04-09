import express from "express";
import "colors";
import cors from "cors";
import { connectDB, disconnectDB } from "./database/methods";
import routeIndex from "./routes/index";
import logger from "./middlewares/loggerMiddleware";
import errorHandler from "./middlewares/errorMiddleware";
import eurekaClient from "./registry/eurekaClient";

const app = express();
const PORT = process.env.PORT;

// Setup parsing middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup logger middleware
app.use(logger);

// Setup routes
app.use("/api", routeIndex);

app.get("/test", (req, res) => {
  const service = eurekaClient.getInstancesByAppId("workflow-service")[0];
  // const ips = fetch(`http://${service.ipAddr}:${service.port}`, {
  //   method: "GET",
  // });

  // res.send({ service, port: (service.port) });
  console.log(service);
});

// Setup error handler middlewares
app.use(errorHandler);

// Connect Database
connectDB();

// Start the server
app.listen(PORT, () =>
  console.log(`Server local: http://localhost:${PORT}`.cyan.bold)
);

// Registering with eureka service reg
eurekaClient.start((error: unknown) => {
  if (error) {
    console.log("❌ Eureka registration failed:", error);
  } else {
    console.log("✅ Registered with Eureka!");
  }
});

// Deregistering from eureka service reg
process.on("SIGINT", () => eurekaClient.stop());

// Setup database disconnect on exit
process.on("SIGINT", disconnectDB);
