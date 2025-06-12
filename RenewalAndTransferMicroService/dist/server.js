"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("colors");
const methods_1 = require("./database/methods");
const index_1 = __importDefault(require("./routes/index"));
const loggerMiddleware_1 = __importDefault(require("./middlewares/loggerMiddleware"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
const eurekaClient_1 = __importDefault(require("./integrations/eureka/eurekaClient"));
const prom_client_1 = __importDefault(require("prom-client"));
const app = (0, express_1.default)();
const PORT = process.env.PORT;
// Setup parsing middlewares
// app.use(cors());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// app.use(contextMiddleware);
// Setup logger middleware
app.use(loggerMiddleware_1.default);
// Setup routes
app.use("/api", index_1.default);
// Setup error handler middlewares
app.use(errorMiddleware_1.default);
// Connect Database
(0, methods_1.connectDB)();
// Start the server
app.listen(PORT, () => console.log(`Server local: http://localhost:${PORT}`.cyan.bold));
/**
 * BELOW IS THE CONFIGURATION FOR PROMETHEUS SCRAPING OF METRICS
 * PLEASE DO NO TOUCH IT
 */
const registry = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register: registry });
//EXPOSING API FOR METRICS
app.get("/metrics", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.set("Content-Type", registry.contentType);
    res.end(yield registry.metrics());
}));
// -------------X-------------X-----------------------
const intId = setInterval(() => {
    // Registering with eureka service reg
    eurekaClient_1.default.start((error) => {
        if (error) {
            console.log("❌ Eureka registration failed:", error);
        }
        else {
            console.log("✅ Registered with Eureka!");
            clearInterval(intId);
        }
    });
}, 100000);
eurekaClient_1.default.start((error) => {
    if (error) {
        console.log("❌ Eureka registration failed:", error);
    }
    else {
        console.log("✅ Registered with Eureka!");
    }
});
// Deregistering from eureka service reg
process.on("SIGINT", () => eurekaClient_1.default.stop());
// Setup database disconnect on exit
process.on("SIGINT", methods_1.disconnectDB);
app.get("/api-gateway", (req, res) => {
    const service = eurekaClient_1.default.getInstancesByAppId("api-gateway")[0];
    const ips = fetch(`http://${service.ipAddr}:${service.port}`, {
        method: "GET",
    });
    res.send({ service, port: service.port });
    console.log(service);
});
app.get("/workflow-service", (req, res) => {
    const service = eurekaClient_1.default.getInstancesByAppId("workflow-service")[0];
    const ips = fetch(`http://${service.ipAddr}:${service.port}`, {
        method: "GET",
    });
    res.send({ service, port: service.port });
    console.log(service);
});
app.get("/user-management-service", (req, res) => {
    const service = eurekaClient_1.default.getInstancesByAppId("user-management-service")[0];
    const ips = fetch(`http://${service.ipAddr}:${service.port}`, {
        method: "GET",
    });
    res.send({ service, port: service.port });
    console.log(service);
});
app.get("/renewl-transfer-service", (req, res) => {
    const service = eurekaClient_1.default.getInstancesByAppId("renewl-transfer-service")[0];
    const ips = fetch(`http://${service.ipAddr}:${service.port}`, {
        method: "GET",
    });
    res.send({ service, port: service.port });
    console.log(service);
});
