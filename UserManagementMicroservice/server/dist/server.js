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
const app_js_1 = __importDefault(require("./app.js"));
const index_config_js_1 = require("./config/index.config.js");
const database_config_js_1 = __importDefault(require("./config/database.config.js"));
const PORT = index_config_js_1.config.port;
const serviceDiscovery_js_1 = require("./utils/serviceDiscovery.js");
const prom_client_1 = __importDefault(require("prom-client"));
/**
 * Establishes a connection to the database using Prisma.
 * Logs a success message upon successful connection.
 * If the connection fails, logs an error message and terminates the process.
 */
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_config_js_1.default.$connect();
        console.log("connected to database successfully 🚀");
    }
    catch (error) {
        console.error("database connection failed ", error);
        process.exit(1);
    }
});
/**
 * Establishes a connection to the server using Express.
 * Logs a success message upon successful connection.
 * If the connection fails, logs an error message.
 */
const connectServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connectDB();
        app_js_1.default.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT} 🚀`);
        });
    }
    catch (_a) {
        console.error("server connection failed");
    }
});
connectServer();
/**
 * Trying to connect with eureka
*/
/*
  EXPOSING DEFAULT METRICS FOR PROMETHEUS SCRAPING
 */
const registry = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register: registry });
app_js_1.default.get('/metrics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.set('Content-Type', registry.contentType);
    res.end(yield registry.metrics());
}));
serviceDiscovery_js_1.eurekaClient.start((error) => {
    if (error) {
        console.log("❌ Eureka registration failed:", error);
    }
    else {
        console.log("✅ Registered with Eureka!");
    }
});
