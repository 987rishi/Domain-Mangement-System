import { Response, Request } from "express";
import {
  getDbNotifications,
  markDbNotificationAsRead,
  markAllDbNotificationsAsRead,
  getUnreadNotificationCount,
  markBulkDbNotificationsAsRead,
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

export const markBulkNotificationsRead = async(req: Request, res: Response): Promise<void> => {
  if (!req.user || typeof req.user.id === "undefined") {
    res
      .status(401)
      .json({
        message: "Unauthorized: User not authenticated or user ID missing",
      });
    return;
  }
  const userEmpNo = BigInt(req.user.id); // Standardize user ID retrieval and ensure BigInt

  const { notification_ids } = req.body;

  if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
    res
      .status(400)
      .json({ message: "notification_ids must be a non-empty array." });
    return;
  }

  let processedNotificationIds: bigint[];
  try {
    processedNotificationIds = notification_ids.map((id) => {
      if (typeof id === "string" || typeof id === "number") {
        const numId = BigInt(id); // Convert to BigInt
        return numId;
      }
      // This case should ideally not happen if frontend sends string/number array
      throw new Error(`Invalid type for notification ID: ${typeof id}`);
    });
  } catch (error) {
    console.error("Error converting notification IDs to BigInt:", error);
    res
      .status(400)
      .json({
        message:
          "Invalid format for one or more notification IDs. Must be convertible to numeric IDs.",
      });
    return;
  }

  if (processedNotificationIds.length === 0 && notification_ids.length > 0) {
    // This case means all provided IDs failed conversion, though the catch above should handle it.
    // Adding for robustness if map somehow returns empty without erroring.
    res
      .status(400)
      .json({
        message: "No valid notification IDs provided after processing.",
      });
    return;
  }

  try {
    const count = await markBulkDbNotificationsAsRead(
      processedNotificationIds,
      userEmpNo
    );
    console.log(
      `User ${userEmpNo} requested to mark ${processedNotificationIds.length} notifications as read. ${count} were updated.`
    );
    res
      .status(200)
      .json({
        message: `Successfully processed request. ${count} notifications marked as read.`,
      });
  } catch (error) {
    console.error("Error in markBulkNotificationsRead controller:", error);
    res
      .status(500)
      .json({ message: "Failed to mark bulk notifications as read." });
  }
};