import { Response, Request } from "express";
import {
  getDbNotifications,
  markDbNotificationAsRead,
  markAllDbNotificationsAsRead,
  getUnreadNotificationCount,
} from "../services/notificationDb.service";
import "../types/event.types";
// Controller to get notifications for the logged-in user
export const getMyNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("The request is", req.user);
  const userEmpNo = req.user.id;

  try {
    const notifications = await getDbNotifications(userEmpNo);
    // Get count of unread notifications
    const unreadCount = await getUnreadNotificationCount(userEmpNo);
    console.log(notifications);
    const messages = notifications.map((msg) => [
      msg.notification_id,
      msg.message,
      msg.event_type,
      msg.created_at,
    ]);
    console.log("messages are: ", messages);
    res.status(200).json({ messages, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Controller to mark a single notification as read
export const markNotificationRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized: User not authenticated" });
    return;
  }
  const userEmpNo = req.user.id;
  const stringId = req.params.id;
  let notificationId: bigint;
  try {
    notificationId = BigInt(stringId);
  } catch (conversionError) {
    if (conversionError instanceof SyntaxError) {
      console.error(
        `Invalid notification ID format '${stringId}':`,
        conversionError
      );
      res
        .status(400)
        .json({
          message: `Invalid notification ID format: '${stringId}'. Must be a numeric ID.`,
        });
      return;
    }
    console.error(
      "Unexpected error during BigInt conversion for notification ID:",
      conversionError
    );
    res
      .status(500)
      .json({ message: "Internal server error processing notification ID." });
    return;
  }

  try {
    const success = await markDbNotificationAsRead(notificationId, userEmpNo);
    if (success) {
      res.status(200).json({ message: "Notification marked as read" });
    } else {
      // Could be not found, already read, or belonged to another user
      res
        .status(404)
        .json({ message: "Notification not found or already read" });
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// Controller to mark all unread notifications as read
export const markAllNotificationsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized: User not authenticated" });
    return;
  }
  const userEmpNo = req.user.emp_no;

  try {
    const count = await markAllDbNotificationsAsRead(userEmpNo);
    res.status(200).json({ message: `Marked ${count} notifications as read.` });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res
      .status(500)
      .json({ message: "Failed to mark all notifications as read" });
  }
};
