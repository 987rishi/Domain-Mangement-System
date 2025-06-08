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
const express_1 = require("express");
const webhook_routes_1 = __importDefault(require("./webhook.routes")); // Import the router we just defined
const notification_routes_1 = __importDefault(require("./notification.routes"));
const prom_client_1 = __importDefault(require("prom-client"));
const mainRouter = (0, express_1.Router)();
// Health check endpoint
mainRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});
/*
  EXPOSING DEFAULT METRICS FOR PROMETHEUS SCRAPING
 */
const registry = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register: registry });
mainRouter.get("/metrics", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.set("Content-Type", registry.contentType);
    res.end(yield registry.metrics());
}));
// Mount all specific API routes under /api/v1
mainRouter.use("/api/v1", webhook_routes_1.default);
// Mount the authenticated notification routes
// All routes will be prefixed with /api/v1/notifications
mainRouter.use("/api/v1/notifications", notification_routes_1.default);
exports.default = mainRouter;
