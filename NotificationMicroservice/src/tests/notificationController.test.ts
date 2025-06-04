import { Request, Response } from "express";
// For Jest's SpiedFunction type if needed, or rely on globals/tsconfig
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationApi.controller"; // Adjust path to your controller
import {
  getDbNotifications,
  markDbNotificationAsRead,
  markAllDbNotificationsAsRead,
  getUnreadNotificationCount,
} from "../services/notificationDb.service"; // Adjust path to your service

// --- Mock the Service Layer ---
jest.mock("../services/notificationDb.service", () => ({
  getDbNotifications: jest.fn(),
  markDbNotificationAsRead: jest.fn(),
  markAllDbNotificationsAsRead: jest.fn(),
  getUnreadNotificationCount: jest.fn(),
}));

// --- Helper Functions ---
const mockRequest = (user: any = null, params: any = {}, body: any = {}) =>
  ({
    user, // For req.user
    params,
    body,
  } as unknown as Request);

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// --- Test Suite ---
describe("Notification Controller", () => {
  let req: Request;
  let res: Response;
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  const mockUserEmpNo = "12345"; // Assuming req.user.id or req.user.emp_no will be this string

  beforeEach(() => {
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // --- Tests for getMyNotifications ---
  describe("getMyNotifications", () => {
    it("should fetch notifications and unread count successfully", async () => {
      req.user = { id: mockUserEmpNo }; // Simulate logged-in user
      const mockNotifications = [
        {
          notification_id: BigInt(1),
          message: "Msg 1",
          event_type: "EVENT_A",
          created_at: new Date(),
        },
        {
          notification_id: BigInt(2),
          message: "Msg 2",
          event_type: "EVENT_B",
          created_at: new Date(),
        },
      ];
      const mockUnreadCount = 5;

      (getDbNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      (getUnreadNotificationCount as jest.Mock).mockResolvedValue(
        mockUnreadCount
      );

      await getMyNotifications(req, res);

      expect(getDbNotifications).toHaveBeenCalledWith(mockUserEmpNo);
      expect(getUnreadNotificationCount).toHaveBeenCalledWith(mockUserEmpNo);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        messages: mockNotifications.map((msg) => [
          msg.notification_id,
          msg.message,
          msg.event_type,
          msg.created_at,
        ]),
        unreadCount: mockUnreadCount,
      });
    });

    it("should handle errors when fetching notifications", async () => {
      req.user = { id: mockUserEmpNo };
      const error = new Error("DB fetch failed");
      (getDbNotifications as jest.Mock).mockRejectedValue(error);
      // getUnreadNotificationCount might also be called, or might not if getDbNotifications fails first.
      // For simplicity, let's assume getDbNotifications fails first.

      await getMyNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch notifications",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching notifications:",
        error
      );
    });

    it("should handle empty notifications list", async () => {
      req.user = { id: mockUserEmpNo };
      (getDbNotifications as jest.Mock).mockResolvedValue([]);
      (getUnreadNotificationCount as jest.Mock).mockResolvedValue(0);

      await getMyNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        messages: [],
        unreadCount: 0,
      });
    });
  });

  // --- Tests for markNotificationRead ---
  describe("markNotificationRead", () => {
    const mockNotificationId = BigInt(789);

    it("should mark a notification as read successfully", async () => {
      req.user = { id: mockUserEmpNo };
      req.params = { id: mockNotificationId.toString() };
      (markDbNotificationAsRead as jest.Mock).mockResolvedValue(true); // Service returns true on success

      await markNotificationRead(req, res);

      expect(markDbNotificationAsRead).toHaveBeenCalledWith(
        mockNotificationId,
        mockUserEmpNo
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notification marked as read",
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = null; // No user
      req.params = { id: mockNotificationId.toString() };

      await markNotificationRead(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized: User not authenticated",
      });
      expect(markDbNotificationAsRead).not.toHaveBeenCalled();
    });

    it("should return 404 if notification not found or already read", async () => {
      req.user = { id: mockUserEmpNo };
      req.params = { id: mockNotificationId.toString() };
      (markDbNotificationAsRead as jest.Mock).mockResolvedValue(false); // Service returns false

      await markNotificationRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notification not found or already read",
      });
    });

    it("should handle errors when marking notification as read", async () => {
      req.user = { id: mockUserEmpNo };
      req.params = { id: mockNotificationId.toString() };
      const error = new Error("DB update failed");
      (markDbNotificationAsRead as jest.Mock).mockRejectedValue(error);

      await markNotificationRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to mark notification as read",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error marking notification as read:",
        error
      );
    });

    it("should handle BigInt conversion error for notification ID", async () => {
      req.user = { id: mockUserEmpNo };
      req.params = { id: "abc" }; // Invalid ID for BigInt

      await markNotificationRead(req, res);

      // The BigInt('abc') will throw a SyntaxError, caught by the generic catch
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: `Invalid notification ID format: 'abc'. Must be a numeric ID.`,
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Invalid notification ID format 'abc':",
        expect.any(SyntaxError)
      );
    });
  });

  // --- Tests for markAllNotificationsRead ---
  describe("markAllNotificationsRead", () => {
    it("should mark all notifications as read successfully", async () => {
      // Note: Controller uses req.user.emp_no, but tests use req.user.id for consistency.
      // Adjust your controller or tests if req.user structure is different.
      // For this test, assuming req.user = { id: 'someId', emp_no: mockUserEmpNo }
      // Or simplify and assume req.user.id IS the emp_no.
      // The controller uses req.user.emp_no for markAll, but req.user.id for the others. This might be an inconsistency.
      // For the test, let's align with the controller's usage for this specific function.
      req.user = { emp_no: mockUserEmpNo, id: "someOtherId" }; // Matching controller's req.user.emp_no
      const mockUpdateCount = 3;
      (markAllDbNotificationsAsRead as jest.Mock).mockResolvedValue(
        mockUpdateCount
      );

      await markAllNotificationsRead(req, res);

      expect(markAllDbNotificationsAsRead).toHaveBeenCalledWith(mockUserEmpNo);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: `Marked ${mockUpdateCount} notifications as read.`,
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = null; // No user

      await markAllNotificationsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized: User not authenticated",
      });
      expect(markAllDbNotificationsAsRead).not.toHaveBeenCalled();
    });

    it("should handle case where no notifications were updated", async () => {
      req.user = { emp_no: mockUserEmpNo, id: "someOtherId" };
      (markAllDbNotificationsAsRead as jest.Mock).mockResolvedValue(0);

      await markAllNotificationsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: `Marked 0 notifications as read.`,
      });
    });

    it("should handle errors when marking all notifications as read", async () => {
      req.user = { emp_no: mockUserEmpNo, id: "someOtherId" };
      const error = new Error("DB mass update failed");
      (markAllDbNotificationsAsRead as jest.Mock).mockRejectedValue(error);

      await markAllNotificationsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to mark all notifications as read",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error marking all notifications as read:",
        error
      );
    });
  });
});
