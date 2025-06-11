/**
 * @file This service module contains all database operations related to notifications.
 * It uses the Prisma Client to interact with the `Notification` table, providing a
 * clean and reusable API for creating, fetching, and updating notification records.
 * @author Your Name
 * @version 1.0.0
 */
import { PrismaClient, Notification, WebhookEventType } from "@prisma/client"; // Import generated client and types
import { ApiNotification } from "../types/webhook.types";
import { timeStamp } from "console";
// import { WebhookEventType } from "../types/event.types";
// Initialize Prisma Client (best practice: create one instance and reuse)
/**
 * @internal
 * The singleton instance of the Prisma Client.
 * It is instantiated once and reused throughout the application to ensure
 * efficient connection pooling.
 */
const prisma = new PrismaClient();

// Function to create a dashboard notification
/**
 * Creates a new notification record in the database.
 *
 * @param recipientEmpNo - The employee number of the user who will receive the notification.
 * @param message - The text content of the notification message.
 * @param eventType - The type of event that triggered this notification. Must be a valid {@link WebhookEventType}.
 * @param triggered_by_emp_no - The employee number of the user who initiated the action.
 * @returns A promise that resolves with the newly created `Notification` object, or `null` if creation fails.
 */
export const createDbNotification = async (
  recipientEmpNo: bigint,
  message: string,
  eventType: any,
  triggered_by_emp_no: bigint
): Promise<Notification | null> => {
  try {
    if (!Object.values(WebhookEventType).includes(eventType)) {
      throw new Error(`Invalid eventType: ${eventType}`);
    }
    const newNotification = await prisma.notification.create({
      data: {
        recipient_emp_no: recipientEmpNo,
        message: message,
        event_type: eventType,
        is_read: false,
        triggered_by_emp_no: triggered_by_emp_no,
      },
    });
    console.log(
      `Dashboard notification created for user ${recipientEmpNo}, ID: ${newNotification.notification_id}`
    );
    return newNotification;
  } catch (error) {
    console.error(
      `Error creating DB notification for user ${recipientEmpNo}:`,
      error
    );
    return null; // Or throw error for controller to handle
  }
};

// Function to get notifications for a user
/**
 * Fetches all unread notifications for a specific user.
 *
 * @remarks
 * This function transforms the `BigInt` types from Prisma into `number` types
 * to ensure they are safely serializable as JSON for API responses.
 *
 * @param userEmpNo - The employee number of the user whose notifications are to be fetched.
 * @returns A promise that resolves with an array of {@link ApiNotification} objects. Returns an empty array on error.
 */
export const getDbNotifications = async (
  userEmpNo: bigint
): Promise<ApiNotification[]> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        recipient_emp_no: userEmpNo,
        is_read: false, // Filter by is_read only if onlyUnread is true
      },
      orderBy: {
        created_at: "desc", // Show newest first
      },
      // Select specific fields if needed, or omit to get all
      select: {
        notification_id: true,
        recipient_emp_no: true,
        message: true,
        is_read: true,
        created_at: true,
        event_type: true,
      },
    });

    // Convert BigInt to number/string for JSON safety before sending to frontend
    return notifications.map((n) => ({
      ...n,
      notification_id: Number(n.notification_id),
      user_emp_no: Number(n.recipient_emp_no), // Convert BigInt to number
    }));
  } catch (error) {
    console.error(`Error fetching notifications for user ${userEmpNo}:`, error);
    return []; // Return empty array on error
  }
};

// Function to mark a single notification as read
/**
 * Marks a single notification as read for a specific user.
 *
 * @remarks
 * This operation includes a critical security check to ensure a user can only
 * mark their own notifications as read.
 *
 * @param notificationId - The ID of the notification to mark as read.
 * @param userEmpNo - The employee number of the user making the request.
 * @returns A promise that resolves to `true` if the notification was successfully updated, otherwise `false`.
 */
export const markDbNotificationAsRead = async (
  notificationId: bigint,
  userEmpNo: bigint
): Promise<boolean> => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        notification_id: BigInt(notificationId), // Convert number to BigInt for query
        recipient_emp_no: userEmpNo, // IMPORTANT: Ensure user can only mark their own!
        is_read: false, // Only update if currently unread
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
    return result.count > 0; // Return true if at least one record was updated
  } catch (error) {
    console.error(
      `Error marking notification ${notificationId} as read for user ${userEmpNo}:`,
      error
    );
    return false;
  }
};

/**
 * Gets the count of unread notifications for a user.
 *
 * @param empNo - The employee number of the user.
 * @returns A promise that resolves with the total number of unread notifications.
 */
export const getUnreadNotificationCount = async (
  empNo: bigint
): Promise<number> => {
  return await prisma.notification.count({
    where: {
      recipient_emp_no: empNo,
      is_read: false, // Assuming 'isRead' exists as a boolean field
    },
  });
};

// Function to mark all unread notifications as read for a user
/**
 * Marks all of a user's unread notifications as read.
 *
 * @param userEmpNo - The employee number of the user.
 * @returns A promise that resolves with the number of notifications that were updated.
 */
export const markAllDbNotificationsAsRead = async (
  userEmpNo: bigint
): Promise<number> => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        recipient_emp_no: userEmpNo,
        is_read: false, // Target only unread ones
      },
      data: {
        is_read: true,
      },
    });
    console.log(
      `Marked ${result.count} notifications as read for user ${userEmpNo}`
    );
    return result.count; // Return the number of notifications updated
  } catch (error) {
    console.error(
      `Error marking all notifications as read for user ${userEmpNo}:`,
      error
    );
    return 0;
  }
};

/**
 * Marks a specific list of notifications as read for a given user.
 *
 * @param notificationIds - An array of notification IDs to be marked as read.
 * @param userEmpNo - The employee number of the user, used for security validation.
 * @returns A promise that resolves with the number of notifications successfully updated.
 * @throws Will throw an error if the database operation fails.
 */
export const markBulkDbNotificationsAsRead = async (
  notificationIds: bigint[],
  userEmpNo: bigint
): Promise<number> => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        notification_id: {
          in: notificationIds,
        },
        recipient_emp_no: userEmpNo, // Crucial: User can only mark their own notifications
        is_read: false, // Optional: Only update those that are currently unread
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
    return result.count; // Returns the number of records updated
  } catch (error) {
    console.error("Error in markBulkDbNotificationsAsRead service:", error);
    // You might want to throw a custom error or handle specific Prisma errors
    throw new Error("Database error while marking bulk notifications as read.");
  }
};

// Graceful shutdown for Prisma Client
process.on("beforeExit", async () => {
  console.log("Disconnecting Prisma Client...");
  await prisma.$disconnect();
});
