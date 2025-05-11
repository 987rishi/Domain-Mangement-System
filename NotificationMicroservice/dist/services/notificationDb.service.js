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
exports.markAllDbNotificationsAsRead = exports.getUnreadNotificationCount = exports.markDbNotificationAsRead = exports.getDbNotifications = exports.createDbNotification = void 0;
const client_1 = require("@prisma/client"); // Import generated client and types
const event_types_1 = require("../types/event.types");
// Initialize Prisma Client (best practice: create one instance and reuse)
const prisma = new client_1.PrismaClient();
// Function to create a dashboard notification
const createDbNotification = (recipientEmpNo, message, eventType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!Object.values(event_types_1.WebhookEventType).includes(eventType)) {
            throw new Error(`Invalid eventType: ${eventType}`);
        }
        const newNotification = yield prisma.notification.create({
            data: {
                recipient_emp_no: recipientEmpNo,
                message: message,
                event_type: eventType,
                is_read: false, // Default is false anyway, but explicit
            },
        });
        console.log(`Dashboard notification created for user ${recipientEmpNo}, ID: ${newNotification.notification_id}`);
        return newNotification;
    }
    catch (error) {
        console.error(`Error creating DB notification for user ${recipientEmpNo}:`, error);
        return null; // Or throw error for controller to handle
    }
});
exports.createDbNotification = createDbNotification;
// Function to get notifications for a user
const getDbNotifications = (userEmpNo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield prisma.notification.findMany({
            where: {
                recipient_emp_no: userEmpNo,
                is_read: false, // Filter by is_read only if onlyUnread is true
            },
            orderBy: {
                created_at: "desc", // Show newest first
            },
            // Select specific fields if needed, or omit to get all
            select: { notification_id: true, recipient_emp_no: true, message: true, is_read: true, created_at: true, event_type: true }
        });
        // Convert BigInt to number/string for JSON safety before sending to frontend
        return notifications.map((n) => (Object.assign(Object.assign({}, n), { notification_id: Number(n.notification_id), user_emp_no: Number(n.recipient_emp_no) // Convert BigInt to number
         })));
    }
    catch (error) {
        console.error(`Error fetching notifications for user ${userEmpNo}:`, error);
        return []; // Return empty array on error
    }
});
exports.getDbNotifications = getDbNotifications;
// Function to mark a single notification as read
const markDbNotificationAsRead = (notificationId, userEmpNo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma.notification.updateMany({
            where: {
                notification_id: BigInt(notificationId), // Convert number to BigInt for query
                recipient_emp_no: userEmpNo, // IMPORTANT: Ensure user can only mark their own!
                is_read: false, // Only update if currently unread
            },
            data: {
                is_read: true,
            },
        });
        return result.count > 0; // Return true if at least one record was updated
    }
    catch (error) {
        console.error(`Error marking notification ${notificationId} as read for user ${userEmpNo}:`, error);
        return false;
    }
});
exports.markDbNotificationAsRead = markDbNotificationAsRead;
const getUnreadNotificationCount = (empNo) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.notification.count({
        where: {
            recipient_emp_no: empNo,
            is_read: false, // Assuming 'isRead' exists as a boolean field
        },
    });
});
exports.getUnreadNotificationCount = getUnreadNotificationCount;
// Function to mark all unread notifications as read for a user
const markAllDbNotificationsAsRead = (userEmpNo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma.notification.updateMany({
            where: {
                recipient_emp_no: userEmpNo,
                is_read: false, // Target only unread ones
            },
            data: {
                is_read: true,
            },
        });
        console.log(`Marked ${result.count} notifications as read for user ${userEmpNo}`);
        return result.count; // Return the number of notifications updated
    }
    catch (error) {
        console.error(`Error marking all notifications as read for user ${userEmpNo}:`, error);
        return 0;
    }
});
exports.markAllDbNotificationsAsRead = markAllDbNotificationsAsRead;
// Graceful shutdown for Prisma Client
process.on("beforeExit", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Disconnecting Prisma Client...");
    yield prisma.$disconnect();
}));
