"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_routes_js_1 = __importDefault(require("./routes/index.routes.js")); // Import the main router from routes/index.ts
const app = (0, express_1.default)();
/**
 * @module Server
 * @description Initializes and configures the Express server.
 */
// --- Middleware ---
/**
 * Parses incoming JSON requests and puts the parsed data in `req.body`.
 */
app.use(express_1.default.json());
// --- Routes ---
/**
 * Mounts the main router containing all API routes.
 */
app.use(index_routes_js_1.default);
// --- Error Handling ---
/**
 * Middleware to handle 404 Not Found errors.
 * This will be triggered if no matching route is found.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction callback
 */
app.use((req, res, next) => {
    res.status(404).json({ message: "Resource not found" });
});
/**
 * Global error handler middleware for handling uncaught errors.
 *
 * @param err - Error object
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction callback
 */
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});
exports.default = app;
