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
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const database_config_1 = __importDefault(require("./config/database.config"));
const serviceDiscovery_1 = require("./utils/serviceDiscovery");
const PORT = config_1.config.port;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_config_1.default.$connect();
        console.log("connected to database successfully 🚀");
    }
    catch (error) {
        console.error("database connection failed ", error);
        process.exit(1);
    }
});
const connectServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connectDB();
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} 🚀`);
        });
    }
    catch (_a) {
        console.error("server connection failed");
    }
});
connectServer();
serviceDiscovery_1.eurekaClient.start((error) => {
    if (error) {
        console.log("❌ Eureka registration failed:", error);
    }
    else {
        console.log("✅ Registered with Eureka!");
    }
});
