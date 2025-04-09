import express, { Express, Request, Response, NextFunction } from "express";
import mainRouter from "./routes/index.routes"; // Import the main router from routes/index.ts

const app: Express = express();

// --- Middleware ---
// Parse JSON request bodies
app.use(express.json());
// Add other middleware like CORS if needed:
// import cors from 'cors';
// app.use(cors()); // Allow requests from your frontend domain

// --- Routes ---
// Mount the main router
app.use(mainRouter);

// --- Error Handling ---
// Not Found Handler (if no route matched)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Resource not found" });
});

// Global Error Handler (catches errors thrown in controllers/middleware)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack);
  // Avoid sending stack trace in production
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
