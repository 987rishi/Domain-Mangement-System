/**
 * @file Configures the Express application.
 * This file creates the Express app instance, wires up the necessary middleware,
 * mounts the main API router, and sets up centralized error handling.
 * The configured app instance is then exported for use by the main server entry point.
 */
import express, { Express, Request, Response, NextFunction } from "express";
import mainRouter from "./routes/index.routes"; // Import the main router from routes/index.ts


/**
 * The core Express application instance. All middleware and routes are attached to this object.
 */
const app: Express = express();


// --- Middleware Configuration ---

/**
 * Globally enables JSON body parsing for incoming requests.
 * This middleware is necessary to access `req.body` in your route handlers.
 */
app.use(express.json());

// Add other middleware like CORS if needed:
// import cors from 'cors';
// app.use(cors()); // Allow requests from your frontend domain


// --- API Routes ---

/**
 * Mounts the main router for the application.
 * All API routes, such as those for notifications, users, etc., are defined
 * within this `mainRouter` and will be accessible from the root path (`/`).
 */
app.use(mainRouter);


// --- Error Handling Middleware ---

/**
 * Catch-all middleware for 404 Not Found errors.
 * This handler is executed if a request does not match any of the routes defined
 * in `mainRouter`. It should be placed after all other route handlers.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function (not used here but required by signature).
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Notification resource not found" });
});

/**
 * Global error handling middleware.
 * This is the final safety net that catches any errors thrown synchronously
 * or passed to `next(err)` asynchronously in the route handlers.
 * It must have a signature of `(err, req, res, next)` to be identified as an
 * error handler by Express.
 *
 * @param err - The error object that was thrown or passed to `next()`.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the stack.
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack);

  // For security, avoid sending a detailed stack trace in a production environment.
  res.status(500).json({ message: "Internal Server Error" });
});

/**
 * Exports the fully configured Express app instance to be used by the server startup script (`index.ts` or `server.ts`).
 */
export default app;