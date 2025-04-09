"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate"); // The placeholder auth middleware
const notificationApi_controller_1 = require("../controllers/notificationApi.controller");
const apiRouter = (0, express_1.Router)();
// --- Dashboard Notification API Endpoints (for Frontend) ---
// These endpoints require authentication
const notificationRouter = (0, express_1.Router)();
notificationRouter.use(authenticate_1.authenticate); // Apply auth middleware to all routes below
// GET /api/v1/notifications (?unread=true)
notificationRouter.get("/", notificationApi_controller_1.getMyNotifications);
// PATCH /api/v1/notifications/:id/read
notificationRouter.patch("/:id/read", notificationApi_controller_1.markNotificationRead);
// POST /api/v1/notifications/mark-all-read
notificationRouter.post("/mark-all-read", notificationApi_controller_1.markAllNotificationsRead);
exports.default = notificationRouter;
