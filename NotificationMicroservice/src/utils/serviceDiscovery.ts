import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { Eureka } from "eureka-js-client";

import os from "os";

dotenv.config();
const app = express();
// app.use(cors());
// app.use(express.json());

const PORT = Number(process.env.PORT) || 4000;
const EUREKA_HOST = process.env.EUREKA_HOST || "localhost";
const EUREKA_PORT = process.env.EUREKA_PORT || "8761";

// Get the actual network IP
const networkInterfaces = os.networkInterfaces();
const localIP =
  Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface && iface.family === "IPv4" && !iface.internal)
    ?.address || "127.0.0.1";

console.log(`🌍 Service IP Address: ${localIP}`);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Node.js Eureka Microservice!" });
});

// 🛠️ Eureka Client Configuration
export const eurekaClient = new Eureka({
  instance: {
    app: "notification-service",
    instanceId: `notification-service-${PORT}`,
    hostName: localIP, // ✅ Use actual network IP
    ipAddr: localIP, // ✅ Use actual network IP
    statusPageUrl: `http://${localIP}:${PORT}`, // ✅ Use actual network IP
    port: {
      "@enabled": true,
      $: Number(PORT),
    },
    vipAddress: "notification-service",
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
  },
  eureka: {
    host: EUREKA_HOST,
    port: Number(EUREKA_PORT),
    servicePath: "/eureka/apps/",
  },
});
