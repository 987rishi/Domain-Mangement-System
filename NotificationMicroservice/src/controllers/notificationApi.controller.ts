import { Response } from "express";
import { AuthenticatedRequest, isValidBigInt } from "../middleware/authenticate"; // Import extended Request type
import {
  getDbNotifications,
  markDbNotificationAsRead,
  markAllDbNotificationsAsRead,
  getUnreadNotificationCount,
} from "../services/notificationDb.service";

// Controller to get notifications for the logged-in user
export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) : Promise<void> => {
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
    const notifications = await getDbNotifications(userEmpNo, onlyUnread);
    // Get count of unread notifications
    const unreadCount = await getUnreadNotificationCount(userEmpNo);
    console.log(notifications);
    const messages = notifications.map((msg)=>{ return msg.message});
    res.status(200).json({messages,unreadCount});
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Controller to mark a single notification as read
export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response
) : Promise<void> => {
  if (!req.user) {
     res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
      return;
  }
  const userEmpNo = req.user.emp_no;
  const notificationId = BigInt(req.params.id);

  if (isValidBigInt(notificationId)) {
     res.status(400).json({ message: "Invalid notification ID" });
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
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
     res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
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
