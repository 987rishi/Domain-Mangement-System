"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_routes_js_1 = __importDefault(require("./routes/index.routes.js")); // Import the main router from routes/index.ts
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// --- Middleware ---
// Parse JSON request bodies
app.use(express_1.default.json());
// Add other middleware like CORS if needed:
// import cors from 'cors';
app.use((0, cors_1.default)()); // Allow requests from your frontend domain
// --- Routes ---
// Mount the main router
app.use(index_routes_js_1.default);
// --- Error Handling ---
// Not Found Handler (if no route matched)
app.use((req, res, next) => {
    res.status(404).json({ message: "Resource not found" });
});
// Global Error Handler (catches errors thrown in controllers/middleware)
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    // Avoid sending stack trace in production
    res.status(500).json({ message: "Internal Server Error" });
});
exports.default = app;
