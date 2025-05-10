import { Eureka } from "eureka-js-client";
import os from "os";

const PORT = Number(process.env.PORT) || 5000;
const EUREKA_HOST = process.env.EUREKA_HOST || "localhost";
const EUREKA_PORT = process.env.EUREKA_PORT || "8761";
const SERVICE_NAME = process.env.SERVICE_NAME || "renewal-transfer-service";

// Get the actual network IP
const networkInterfaces = os.networkInterfaces();
const localIP =
  Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface && iface.family === "IPv4" && !iface.internal)
    ?.address || "127.0.0.1";

console.log(`🌍 Service IP Address: ${localIP}`);

// 🛠️ Eureka Client Configuration
const eurekaClient = new Eureka({
  instance: {
    app: SERVICE_NAME,
    instanceId: `${SERVICE_NAME}-${PORT}`,
    hostName: localIP,
    ipAddr: localIP,
    statusPageUrl: `http://${localIP}:${PORT}`,
    port: {
      "@enabled": true,
      $: Number(PORT),
    },
    vipAddress: SERVICE_NAME,
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

export default eurekaClient;
