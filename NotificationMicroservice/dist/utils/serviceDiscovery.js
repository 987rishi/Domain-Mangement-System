"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eurekaClient = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const eureka_js_client_1 = require("eureka-js-client");
const os_1 = __importDefault(require("os"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// app.use(cors());
// app.use(express.json());
const PORT = Number(process.env.NMS_PORT) || 3001;
const EUREKA_HOST = process.env.EUREKA_HOST || "localhost";
const EUREKA_PORT = process.env.EUREKA_PORT || "8761";
// Get the actual network IP
const networkInterfaces = os_1.default.networkInterfaces();
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
function getLocalIpAddress() {
    // 1. Check for explicit override via environment variable
    const explicitHostIp = process.env.HOST_IP;
    if (explicitHostIp) {
        console.log(`🌍 Using explicitly set HOST_IP: ${explicitHostIp}`);
        return explicitHostIp;
    }
    // 2. Attempt to find a suitable IP from network interfaces
    const networkInterfaces = os_1.default.networkInterfaces();
    const candidates = [];
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        if (interfaces) {
            for (const iface of interfaces) {
                // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
                // Skip over link-local addresses (169.254.x.x) which are not typically routable
                if (iface.family === "IPv4" &&
                    !iface.internal &&
                    !iface.address.startsWith("169.254.")) {
                    // Prioritize common interface names if possible, though this is not perfectly reliable
                    if (["eth0", "en0", "wlan0", "wifi0"].includes(interfaceName.toLowerCase())) {
                        candidates.unshift(iface.address); // Add to the beginning (higher priority)
                    }
                    else {
                        candidates.push(iface.address); // Add to the end
                    }
                }
            }
        }
    }
    if (candidates.length > 0) {
        // Return the first candidate (which might have been prioritized)
        console.log(`🌍 Automatically detected IP Address: ${candidates[0]}. Candidates: ${candidates.join(", ")}`);
        return candidates[0];
    }
    // 3. Fallback if no suitable IP is found
    console.warn("⚠️ Could not automatically determine a suitable non-internal IPv4 address. Falling back to '127.0.0.1'. " +
        "Consider setting the HOST_IP environment variable if this service needs to be accessible externally.");
    return "127.0.0.1";
}
const localIP = getLocalIpAddress();
console.log(`🌍 Service IP Address: ${localIP}`);
app.get("/", (req, res) => {
    res.json({ message: "Hello from Node.js Eureka Microservice!" });
});
// 🛠️ Eureka Client Configuration
exports.eurekaClient = new eureka_js_client_1.Eureka({
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
