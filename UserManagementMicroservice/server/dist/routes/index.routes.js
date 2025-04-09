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
mainRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});
// provide the login routes
mainRouter.use("/api/auth", auth_routes_js_1.default);
// provide the user details routes
mainRouter.use("/api/users", user_routes_js_1.default);
// DRM and ARM assignment Routes
mainRouter.use("/api/projects", assign_routes_js_1.default);
// Update user details Routes
mainRouter.use("/api/update/users", update_routes_js_1.default);
exports.default = mainRouter;
