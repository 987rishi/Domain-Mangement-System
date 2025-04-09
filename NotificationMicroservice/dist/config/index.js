"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3001,
    webhookSecret: process.env.WEBHOOK_SECRET || "",
    email: {
        host: process.env.EMAIL_HOST || "",
        port: parseInt(process.env.EMAIL_PORT || "587", 10),
        secure: process.env.EMAIL_SECURE === "true",
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || "",
        from: process.env.EMAIL_FROM || "",
    },
    userService: {
        // Example if calling User Service
        apiUrl: process.env.USER_SERVICE_API_URL,
        apiKey: process.env.USER_SERVICE_API_KEY,
    },
};
// Basic validation
if (!exports.config.webhookSecret) {
    console.error("FATAL ERROR: WEBHOOK_SECRET is not defined in .env");
    process.exit(1);
}
if (!exports.config.email.user || !exports.config.email.pass || !exports.config.email.host) {
    console.warn("WARN: Email configuration might be incomplete in .env");
}
