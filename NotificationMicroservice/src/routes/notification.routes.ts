import { Router } from "express";
import { verifyWebhookSecret } from "../middleware/verifyWebhook";
import { handleWebhook } from "../controllers/webhook.controller";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  markBulkNotificationsRead,
} from "../controllers/notificationApi.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { Request,Response } from "express";
// --- Dashboard Notification API Endpoints (for Frontend) ---
// These endpoints require authentication
const notificationRouter = Router();

notificationRouter.get("/health",(req:Request,res:Response)=>{
  res.send("hello")
})
// GET /api/v1/notifications/unread (?unread=true)
notificationRouter.get("/unread", authMiddleware,getMyNotifications);
// PATCH /api/v1/notifications/:id/read
notificationRouter.patch("/:id/read", authMiddleware, markNotificationRead);

// POST /api/v1/notifications/mark-all-read
notificationRouter.post("/mark-all-read", authMiddleware, markAllNotificationsRead);

// POST /api/v1/notifications/mark-bulk-read
notificationRouter.post("/mark-bulk-read", authMiddleware, markBulkNotificationsRead);


export default notificationRouter;
