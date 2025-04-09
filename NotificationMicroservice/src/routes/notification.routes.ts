import { Router } from "express";
import { verifyWebhookSecret } from "../middleware/verifyWebhook";
import { handleWebhook } from "../controllers/webhook.controller";
import { authenticate } from "../middleware/authenticate"; // The placeholder auth middleware
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationApi.controller";

const apiRouter = Router();



// --- Dashboard Notification API Endpoints (for Frontend) ---
// These endpoints require authentication
const notificationRouter = Router();
notificationRouter.use(authenticate); // Apply auth middleware to all routes below

// GET /api/v1/notifications (?unread=true)
notificationRouter.get("/", getMyNotifications);

// PATCH /api/v1/notifications/:id/read
notificationRouter.patch("/:id/read", markNotificationRead);

// POST /api/v1/notifications/mark-all-read
notificationRouter.post("/mark-all-read", markAllNotificationsRead);



export default notificationRouter;
