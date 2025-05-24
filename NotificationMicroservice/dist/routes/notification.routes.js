"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationApi_controller_1 = require("../controllers/notificationApi.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
// --- Dashboard Notification API Endpoints (for Frontend) ---
// These endpoints require authentication
const notificationRouter = (0, express_1.Router)();
notificationRouter.get("/health", (req, res) => {
    res.send("hello");
});
// GET /api/v1/notifications/unread (?unread=true)
notificationRouter.get("/unread", authMiddleware_1.authMiddleware, notificationApi_controller_1.getMyNotifications);
// PATCH /api/v1/notifications/:id/read
notificationRouter.patch("/:id/read", authMiddleware_1.authMiddleware, notificationApi_controller_1.markNotificationRead);
// POST /api/v1/notifications/mark-all-read
notificationRouter.post("/mark-all-read", authMiddleware_1.authMiddleware, notificationApi_controller_1.markAllNotificationsRead);
exports.default = notificationRouter;
