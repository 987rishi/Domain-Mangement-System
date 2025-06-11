/**
 * @file This file defines and configures the main application router.
 * It serves as the central hub for all API routes, mounting specific feature routers
 * (like webhooks and notifications) under a versioned path. It also provides essential
 * operational endpoints for health checks and Prometheus metrics.
 */
import { Router } from "express";
import apiRouter from "./webhook.routes"; // Import the router we just defined
import notificationRouter from "./notification.routes";
import client from "prom-client";

/**
 * The main Express router instance for the entire application.
 * It aggregates all other feature-specific routers and top-level operational endpoints.
 */
const mainRouter = Router();


/**
 * Provides a simple health check endpoint.
 * This is typically used by load balancers or container orchestrators (like Kubernetes)
 * to verify that the service is running and able to handle requests.
 *
 * @route GET /health
 * @returns A 200 OK response with a JSON body: `{ status: 'UP', timestamp: '...' }`.
 */
mainRouter.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

/*
  EXPOSING DEFAULT METRICS FOR PROMETHEUS SCRAPING
 */

/**
 * Exposes application metrics in the Prometheus text-based format.
 * This endpoint is intended to be scraped by a Prometheus server for monitoring and alerting.
 *
 * @route GET /metrics
 * @remarks
 * It uses the `prom-client` library to collect default Node.js metrics (CPU usage,
 * memory, event loop lag, etc.). The response content type is set appropriately
 * for Prometheus consumption.
 */
const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

mainRouter.get("/metrics", async (req, res) => {
  res.set("Content-Type", registry.contentType);
  res.end(await registry.metrics());
});

// Mount all specific API routes under /api/v1
/**
 * Mounts the webhook API router.
 * All routes defined within `webhook.routes.ts` will be available under the `/api/v1` path prefix.
 * For example, a route `/event` in `webhook.routes.ts` becomes `/api/v1/event`.
 */
mainRouter.use("/api/v1", apiRouter);
// Mount the authenticated notification routes
// All routes will be prefixed with /api/v1/notifications
/**
 * Mounts the authenticated notification routes.
 * All routes defined within `notification.routes.ts` will be available under the `/api/v1/notifications` path prefix.
 * For example, a route `/` in `notification.routes.ts` becomes `/api/v1/notifications/`.
 */
mainRouter.use("/api/v1/notifications", notificationRouter);

/**
 * Exports the fully configured main router instance to be used by `app.ts`.
 */
export default mainRouter;
