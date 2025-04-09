"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsRead = exports.markNotificationRead = exports.getMyNotifications = void 0;
const authenticate_1 = require("../middleware/authenticate"); // Import extended Request type
const notificationDb_service_1 = require("../services/notificationDb.service");
// Controller to get notifications for the logged-in user
const getMyNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res
            .status(401)
            .json({ message: "Unauthorized: User not authenticated" });
        return;
    }
    const userEmpNo = req.user.emp_no;
    // Check for query parameter to filter ?unread=true
    const onlyUnread = req.query.unread === "true";
    try {
        const notifications = yield (0, notificationDb_service_1.getDbNotifications)(userEmpNo, onlyUnread);
        // Get count of unread notifications
        const unreadCount = yield (0, notificationDb_service_1.getUnreadNotificationCount)(userEmpNo);
        console.log(notifications);
        const messages = notifications.map((msg) => { return msg.message; });
        res.status(200).json({ messages, unreadCount });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});
exports.getMyNotifications = getMyNotifications;
// Controller to mark a single notification as read
const markNotificationRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res
            .status(401)
            .json({ message: "Unauthorized: User not authenticated" });
        return;
    }
    const userEmpNo = req.user.emp_no;
    const notificationId = BigInt(req.params.id);
    if ((0, authenticate_1.isValidBigInt)(notificationId)) {
        res.status(400).json({ message: "Invalid notification ID" });
        return;
    }
    try {
        const success = yield (0, notificationDb_service_1.markDbNotificationAsRead)(notificationId, userEmpNo);
        if (success) {
            res.status(200).json({ message: "Notification marked as read" });
        }
        else {
            // Could be not found, already read, or belonged to another user
            res
                .status(404)
                .json({ message: "Notification not found or already read" });
        }
    }
    catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Failed to mark notification as read" });
    }
});
exports.markNotificationRead = markNotificationRead;
// Controller to mark all unread notifications as read
const markAllNotificationsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res
            .status(401)
            .json({ message: "Unauthorized: User not authenticated" });
        return;
    }
    const userEmpNo = req.user.emp_no;
    try {
        const count = yield (0, notificationDb_service_1.markAllDbNotificationsAsRead)(userEmpNo);
        res.status(200).json({ message: `Marked ${count} notifications as read.` });
    }
    catch (error) {
        console.error("Error marking all notifications as read:", error);
        res
            .status(500)
            .json({ message: "Failed to mark all notifications as read" });
    }
});
exports.markAllNotificationsRead = markAllNotificationsRead;
