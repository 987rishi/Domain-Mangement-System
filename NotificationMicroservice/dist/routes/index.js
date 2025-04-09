"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const api_routes_1 = __importDefault(require("./api.routes")); // Import the router we just defined
const mainRouter = (0, express_1.Router)();
// Health check endpoint
mainRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});
// Mount all specific API routes under /api/v1
mainRouter.use("/api/v1", api_routes_1.default);
exports.default = mainRouter;
