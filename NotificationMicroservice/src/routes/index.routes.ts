import { Router } from "express";
import apiRouter from "./webhook.routes"; // Import the router we just defined
import notificationRouter from "./notification.routes"
const mainRouter = Router();

// Health check endpoint
mainRouter.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

// Mount all specific API routes under /api/v1
mainRouter.use("/api/v1", apiRouter);
// Mount the authenticated notification routes
// All routes will be prefixed with /api/v1/notifications
mainRouter.use("/api/v1/notifications", notificationRouter);



export default mainRouter;
