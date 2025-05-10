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
const PORT = Number(process.env.PORT) || 4000;
const EUREKA_HOST = process.env.EUREKA_HOST || "localhost";
const EUREKA_PORT = process.env.EUREKA_PORT || "8761";
// Get the actual network IP
const networkInterfaces = os_1.default.networkInterfaces();
// const localIP =
//   Object.values(networkInterfaces)
//     .flat()
//     .find((iface) => iface && iface.family === "IPv4" && !iface.internal)
//     ?.address || "127.0.0.1";
function getTailscaleIP() {
    const interfaces = os_1.default.networkInterfaces();
    for (const [name, addrs] of Object.entries(interfaces)) {
        if (name.startsWith("tailscale") || name.startsWith("ts")) {
            const iface = addrs === null || addrs === void 0 ? void 0 : addrs.find((addr) => addr.family === "IPv4" && !addr.internal);
            if (iface)
                return iface.address;
        }
    }
    // fallback to first non-internal IPv4
    for (const addrs of Object.values(interfaces)) {
        const iface = addrs === null || addrs === void 0 ? void 0 : addrs.find((addr) => addr.family === "IPv4" && !addr.internal);
        if (iface)
            return iface.address;
    }
    return "127.0.0.1";
}
const localIP = getTailscaleIP();
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
