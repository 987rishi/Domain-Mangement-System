"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const eureka_js_client_1 = require("eureka-js-client");
const os_1 = __importDefault(require("os"));
const PORT = Number(process.env.PORT) || 5000;
const EUREKA_HOST = process.env.EUREKA_HOST || "localhost";
const EUREKA_PORT = process.env.EUREKA_PORT || "8761";
const SERVICE_NAME = process.env.SERVICE_NAME || "renewal-transfer-service";
// Get the actual network IP
const networkInterfaces = os_1.default.networkInterfaces();
const localIP = ((_a = Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface && iface.family === "IPv4" && !iface.internal)) === null || _a === void 0 ? void 0 : _a.address) || "127.0.0.1";
console.log(`🌍 Service IP Address: ${localIP}`);
// 🛠️ Eureka Client Configuration
const eurekaClient = new eureka_js_client_1.Eureka({
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
exports.default = eurekaClient;
