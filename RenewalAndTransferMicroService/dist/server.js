"use strict";
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
const app = (0, express_1.default)();
const PORT = process.env.PORT;
// Setup parsing middlewares
// app.use(cors());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
// eurekaClient.start((error: unknown) => {
//   if (error) {
//     console.log("❌ Eureka registration failed:", error);
//   } else {
//     console.log("✅ Registered with Eureka!");
//   }
// });
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
