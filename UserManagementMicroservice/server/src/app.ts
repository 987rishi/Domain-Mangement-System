import express, { Express, Request, Response, NextFunction } from "express";
import mainRouter from "./routes/index.routes.js"; // Import the main router from routes/index.ts


const app: Express = express();

/**
 * @module Server
 * @description Initializes and configures the Express server.
 */

// --- Middleware ---

/**
 * Parses incoming JSON requests and puts the parsed data in `req.body`.
 */
app.use(express.json());



// --- Routes ---

/**
 * Mounts the main router containing all API routes.
 */
app.use(mainRouter);

// --- Error Handling ---

/**
 * Middleware to handle 404 Not Found errors.
 * This will be triggered if no matching route is found.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction callback
 */
app.use((req: Request, res: Response, next: NextFunction) => {
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
