"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhook_routes_1 = __importDefault(require("./webhook.routes")); // Import the router we just defined
const notification_routes_1 = __importDefault(require("./notification.routes"));
const mainRouter = (0, express_1.Router)();
// Health check endpoint
mainRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});
// Mount all specific API routes under /api/v1
mainRouter.use("/api/v1", webhook_routes_1.default);
// Mount the authenticated notification routes
// All routes will be prefixed with /api/v1/notifications
mainRouter.use("/api/v1/notifications", notification_routes_1.default);
exports.default = mainRouter;
