/**
 * @file This file contains the controllers for handling user notifications.
 * It provides endpoints for fetching, and marking notifications as read (individually, in bulk, or all at once).
 * @author Raj Raushan
 * @version 1.0.0
 */
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
/**
 * Controller to get all notifications for the currently authenticated user.
 * It also fetches the count of unread notifications.
 *
 * @route GET /api/notifications
 * @param req - The Express request object. It is expected to contain `req.user`
 * with an `id` property from an authentication middleware.
 * @param res - The Express response object used to send back the notifications list
 * and unread count.
 * @returns A promise that resolves when the response has been sent. The response body
 * on success is a JSON object: `{ messages: Notification[], unreadCount: number }`.
 */
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
/**
 * Controller to mark a single notification as read.
 * The notification ID is provided as a URL parameter.
 *
 * @route PUT /api/notifications/:id/read
 * @param req - The Express request object. Expects `req.params.id` to be the
 * numeric ID of the notification and `req.user` to be present for authentication.
 * @param res - The Express response object.
 * @returns A promise that resolves when the response has been sent. Sends a 200
 * status on success, 404 if not found, 400 for an invalid ID, or 401 if unauthenticated.
 */
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
      res.status(400).json({
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
/**
 * Controller to mark all of the authenticated user's unread notifications as read.
 *
 * @route PUT /api/notifications/mark-all-read
 * @param req - The Express request object, containing `req.user` for authentication.
 * Note: This implementation uses `req.user.emp_no`.
 * @param res - The Express response object.
 * @returns A promise that resolves when the response is sent. The response body
 * on success includes the count of notifications that were updated.
 */
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

/**
 * Controller to mark a list of specified notifications as read.
 * The list of notification IDs is provided in the request body.
 *
 * @remarks
 * This endpoint is for marking multiple, specific notifications as read in a single request.
 * It expects a JSON payload containing an array of notification IDs.
 *
 * @route POST /api/notifications/mark-bulk-read
 * @param req - The Express request object. Must contain `req.user` for authentication and
 * a body with `{ "notification_ids": [id1, id2, ...] }`.
 * @param res - The Express response object.
 * @returns A promise that resolves after sending the response. On success, it returns a
 * message indicating how many notifications were successfully updated.
 *
 * @example
 * Request Body:
 * ```json
 * {
 *   "notification_ids": ["123456789012345678", "123456789012345679"]
 * }
 * ```
 */
export const markBulkNotificationsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user || typeof req.user.id === "undefined") {
    res.status(401).json({
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
    res.status(400).json({
      message:
        "Invalid format for one or more notification IDs. Must be convertible to numeric IDs.",
    });
    return;
  }

  if (processedNotificationIds.length === 0 && notification_ids.length > 0) {
    // This case means all provided IDs failed conversion, though the catch above should handle it.
    // Adding for robustness if map somehow returns empty without erroring.
    res.status(400).json({
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
    res.status(200).json({
      message: `Successfully processed request. ${count} notifications marked as read.`,
    });
  } catch (error) {
    console.error("Error in markBulkNotificationsRead controller:", error);
    res
      .status(500)
      .json({ message: "Failed to mark bulk notifications as read." });
  }
};
