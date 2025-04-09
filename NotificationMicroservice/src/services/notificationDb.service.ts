import { PrismaClient, Notification } from "@prisma/client"; // Import generated client and types
import { ApiNotification } from "../types/webhook.types";

// Initialize Prisma Client (best practice: create one instance and reuse)
const prisma = new PrismaClient();

// Function to create a dashboard notification
export const createDbNotification = async (
  recipientEmpNo: bigint,
  message: string,
  eventType?: string
): Promise<Notification | null> => {
  try {
    // Basic check: Ensure the recipient user exists (optional, depends on FK constraint handling)
    const userExists = await prisma.user.findUnique({ where: { emp_no: recipientEmpNo } });
    if (!userExists) {
        console.warn(`User with emp_no ${recipientEmpNo} not found. Skipping notification creation.`);
        return null;
    }

    const newNotification = await prisma.notification.create({
      data: {
        user_emp_no: recipientEmpNo,
        message: message,
        event_type: eventType,
        is_read: false, // Default is false anyway, but explicit
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
export const getDbNotifications = async (
  userEmpNo: bigint,
  onlyUnread: boolean = false
): Promise<ApiNotification[]> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        user_emp_no: userEmpNo,
        is_read: onlyUnread ? false : undefined, // Filter by is_read only if onlyUnread is true
      },
      orderBy: {
        created_at: "desc", // Show newest first
      },
      // Select specific fields if needed, or omit to get all
      // select: { notification_id: true, message: true, is_read: true, created_at: true, link_url: true }
    });

    // Convert BigInt to number/string for JSON safety before sending to frontend
    return notifications.map((n) => ({
      ...n,
      notification_id: Number(n.notification_id),
      user_emp_no:Number(n.user_emp_no) // Convert BigInt to number
    }));
  } catch (error) {
    console.error(`Error fetching notifications for user ${userEmpNo}:`, error);
    return []; // Return empty array on error
  }
};

// Function to mark a single notification as read
export const markDbNotificationAsRead = async (
  notificationId: bigint,
  userEmpNo: bigint
): Promise<boolean> => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        notification_id: BigInt(notificationId), // Convert number to BigInt for query
        user_emp_no: userEmpNo, // IMPORTANT: Ensure user can only mark their own!
        is_read: false, // Only update if currently unread
      },
      data: {
        is_read: true,
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

export const getUnreadNotificationCount = async (
  empNo: bigint
): Promise<number> => {
  return await prisma.notification.count({
    where: {
      user_emp_no: empNo,
      is_read: false, // Assuming 'isRead' exists as a boolean field
    },
  });
};


// Function to mark all unread notifications as read for a user
export const markAllDbNotificationsAsRead = async (
  userEmpNo: bigint
): Promise<number> => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        user_emp_no: userEmpNo,
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

// Graceful shutdown for Prisma Client
process.on("beforeExit", async () => {
  console.log("Disconnecting Prisma Client...");
  await prisma.$disconnect();
});
