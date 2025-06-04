import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import assignRoutes from "./assign.routes.js";
import updateRoutes from "./update.routes.js";
import client from "prom-client";

const mainRouter = Router();

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
/*
  EXPOSING DEFAULT METRICS FOR PROMETHEUS SCRAPING
 */
const registry = new client.Registry();
client.collectDefaultMetrics({ register:registry });

mainRouter.get("/metrics", async (req, res) => {
  res.set("Content-Type", registry.contentType);
  res.end(await registry.metrics());
});

/**
 * Auth routes for login and LDAP authentication.
 *
 * @route /api/auth
 */
mainRouter.use("/api/auth", authRoutes);

/**
 * User management routes.
 * Provides endpoints to retrieve and manage user details.
 *
 * @route /api/users
 */
mainRouter.use("/api/users", userRoutes);

/**
 * DRM and ARM assignment routes.
 * Assigns users to projects based on their roles.
 *
 * @route /api/projects
 */
mainRouter.use("/api/projects", assignRoutes);

/**
 * Update routes for modifying user details.
 *
 * @route /api/update/users
 */
mainRouter.use("/api/update/users", updateRoutes);

export default mainRouter;
