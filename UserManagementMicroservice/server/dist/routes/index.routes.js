"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_js_1 = __importDefault(require("./auth.routes.js"));
const user_routes_js_1 = __importDefault(require("./user.routes.js"));
const assign_routes_js_1 = __importDefault(require("./assign.routes.js"));
const update_routes_js_1 = __importDefault(require("./update.routes.js"));
const mainRouter = (0, express_1.Router)();
/**
 * @module Routes/MainRouter
 * @description This is the central router for all application-level routes.
 */
/**
 * Health check endpoint.
 * Returns server status and current timestamp.
 *
 * @route GET /health
 * @returns {Object} 200 - JSON object indicating server is running
 */
mainRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});
/**
 * Auth routes for login and LDAP authentication.
 *
 * @route /api/auth
 */
mainRouter.use("/api/auth", auth_routes_js_1.default);
/**
 * User management routes.
 * Provides endpoints to retrieve and manage user details.
 *
 * @route /api/users
 */
mainRouter.use("/api/users", user_routes_js_1.default);
/**
 * DRM and ARM assignment routes.
 * Assigns users to projects based on their roles.
 *
 * @route /api/projects
 */
mainRouter.use("/api/projects", assign_routes_js_1.default);
/**
 * Update routes for modifying user details.
 *
 * @route /api/update/users
 */
mainRouter.use("/api/update/users", update_routes_js_1.default);
exports.default = mainRouter;
