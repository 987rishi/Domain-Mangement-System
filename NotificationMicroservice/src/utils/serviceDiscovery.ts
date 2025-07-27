import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { Eureka } from "eureka-js-client";

import os from "os";

dotenv.config();
const app = express();
// app.use(cors());
// app.use(express.json());

const PORT = Number(process.env.NMS_PORT) || 3001;
const EUREKA_HOST = process.env.EUREKA_HOST || "localhost";
const EUREKA_PORT = process.env.EUREKA_PORT || "8761";
const ZITI_HOSTNAME_NOTIFICATION = process.env.ZITI_HOSTNAME_NOTIFICATION || "notification.ziti"

// Get the actual network IP
const networkInterfaces = os.networkInterfaces();
// const localIP =
//   Object.values(networkInterfaces)
//     .flat()
//     .find((iface) => iface && iface.family === "IPv4" && !iface.internal)
//     ?.address || "127.0.0.1";
    // function getTailscaleIP(): string {
    //   const interfaces = os.networkInterfaces();
    //   for (const [name, addrs] of Object.entries(interfaces)) {
    //     if (name.startsWith("tailscale") || name.startsWith("ts")) {
    //       const iface = addrs?.find(
    //         (addr) => addr.family === "IPv4" && !addr.internal
    //       );
    //       if (iface) return iface.address;
    //     }
    //   }
    //   // fallback to first non-internal IPv4
    //   for (const addrs of Object.values(interfaces)) {
    //     const iface = addrs?.find(
    //       (addr) => addr.family === "IPv4" && !addr.internal
    //     );
    //     if (iface) return iface.address;
    //   }
    //   return "127.0.0.1";
    // }

  /**
 * Determines the most suitable non-internal IPv4 address for this service to advertise to Eureka.
 *
 * @remarks
 * This function follows a specific priority order to find the best IP address:
 * 1.  **Explicit Override:** It first checks for the `HOST_IP` environment variable. This is the recommended
 *     approach for containerized environments (like Docker) where the host's IP must be explicitly passed.
 * 2.  **Automatic Detection:** If no override is found, it scans all network interfaces and filters for addresses that are:
 *     - IPv4
 *     - Not internal (e.g., not `127.0.0.1`)
 *     - Not link-local (e.g., not `169.254.x.x`)
 *     It gives priority to common interface names like `eth0` or `en0`.
 * 3.  **Fallback:** If no suitable IP is found, it logs a warning and defaults to `127.0.0.1`.
 *
 * @returns {string} The determined IP address as a string.
 * @internal
 */
    function getLocalIpAddress(): string {
      // 1. Check for explicit override via environment variable
      const explicitHostIp = process.env.HOST_IP;
      if (explicitHostIp) {
        console.log(`🌍 Using explicitly set HOST_IP: ${explicitHostIp}`);
        return explicitHostIp;
      }

      // 2. Attempt to find a suitable IP from network interfaces
      const networkInterfaces = os.networkInterfaces();
      const candidates: string[] = [];

      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        if (interfaces) {
          for (const iface of interfaces) {
            // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
            // Skip over link-local addresses (169.254.x.x) which are not typically routable
            if (
              iface.family === "IPv4" &&
              !iface.internal &&
              !iface.address.startsWith("169.254.")
            ) {
              // Prioritize common interface names if possible, though this is not perfectly reliable
              if (
                ["eth0", "en0", "wlan0", "wifi0"].includes(
                  interfaceName.toLowerCase()
                )
              ) {
                candidates.unshift(iface.address); // Add to the beginning (higher priority)
              } else {
                candidates.push(iface.address); // Add to the end
              }
            }
          }
        }
      }

      if (candidates.length > 0) {
        // Return the first candidate (which might have been prioritized)
        console.log(
          `🌍 Automatically detected IP Address: ${
            candidates[0]
          }. Candidates: ${candidates.join(", ")}`
        );
        return candidates[0];
      }

      // 3. Fallback if no suitable IP is found
      console.warn(
        "⚠️ Could not automatically determine a suitable non-internal IPv4 address. Falling back to '127.0.0.1'. " +
          "Consider setting the HOST_IP environment variable if this service needs to be accessible externally."
      );
      return "127.0.0.1";
    }

    const localIP = getLocalIpAddress();
    
console.log(`🌍 Service IP Address: ${localIP}`);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Node.js Eureka Microservice!" });
});

// 🛠️ Eureka Client Configuration

/**
 * @description The configured Eureka client instance for this microservice.
 * This instance is exported and used by the main application entry point (`index.ts`)
 * to start the registration and heartbeat process with the Eureka server.
 *
 * @remarks
 * The configuration is split into two main sections:
 * - **`instance`**: Describes this specific microservice instance.
 *   - `app`: The logical name of the service ('notification-service').
 *   - `hostName` & `ipAddr`: ✅ Set to the dynamically determined `localIP` for correct network routing.
 *   - `statusPageUrl`: ✅ A reachable URL for health checks, also using the `localIP`.
 * - **`eureka`**: Describes the Eureka server to connect to.
 *   - `host`, `port`: Location of the Eureka server, loaded from environment variables.
 */

export const eurekaClient = new Eureka({
  instance: {
    app: "notification-service",
    instanceId: `notification-service-${PORT}`,
    hostName: ZITI_HOSTNAME_NOTIFICATION, // ✅ Use actual network IP
    ipAddr: ZITI_HOSTNAME_NOTIFICATION, // ✅ Use actual network IP
    statusPageUrl: `http://${ZITI_HOSTNAME_NOTIFICATION}:${PORT}`, // ✅ Use actual network IP
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
