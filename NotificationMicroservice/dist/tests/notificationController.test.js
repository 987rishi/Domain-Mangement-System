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
// For Jest's SpiedFunction type if needed, or rely on globals/tsconfig
const notificationApi_controller_1 = require("../controllers/notificationApi.controller"); // Adjust path to your controller
const notificationDb_service_1 = require("../services/notificationDb.service"); // Adjust path to your service
// --- Mock the Service Layer ---
jest.mock("../services/notificationDb.service", () => ({
    getDbNotifications: jest.fn(),
    markDbNotificationAsRead: jest.fn(),
    markAllDbNotificationsAsRead: jest.fn(),
    getUnreadNotificationCount: jest.fn(),
}));
// --- Helper Functions ---
const mockRequest = (user = null, params = {}, body = {}) => ({
    user, // For req.user
    params,
    body,
});
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
// --- Test Suite ---
describe("Notification Controller", () => {
    let req;
    let res;
    let consoleLogSpy;
    let consoleErrorSpy;
    const mockUserEmpNo = "12345"; // Assuming req.user.id or req.user.emp_no will be this string
    beforeEach(() => {
        jest.clearAllMocks();
        req = mockRequest();
        res = mockResponse();
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });
    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });
    // --- Tests for getMyNotifications ---
    describe("getMyNotifications", () => {
        it("should fetch notifications and unread count successfully", () => __awaiter(void 0, void 0, void 0, function* () {
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
            notificationDb_service_1.getDbNotifications.mockResolvedValue(mockNotifications);
            notificationDb_service_1.getUnreadNotificationCount.mockResolvedValue(mockUnreadCount);
            yield (0, notificationApi_controller_1.getMyNotifications)(req, res);
            expect(notificationDb_service_1.getDbNotifications).toHaveBeenCalledWith(mockUserEmpNo);
            expect(notificationDb_service_1.getUnreadNotificationCount).toHaveBeenCalledWith(mockUserEmpNo);
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
        }));
        it("should handle errors when fetching notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            req.user = { id: mockUserEmpNo };
            const error = new Error("DB fetch failed");
            notificationDb_service_1.getDbNotifications.mockRejectedValue(error);
            // getUnreadNotificationCount might also be called, or might not if getDbNotifications fails first.
            // For simplicity, let's assume getDbNotifications fails first.
            yield (0, notificationApi_controller_1.getMyNotifications)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Failed to fetch notifications",
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching notifications:", error);
        }));
        it("should handle empty notifications list", () => __awaiter(void 0, void 0, void 0, function* () {
            req.user = { id: mockUserEmpNo };
            notificationDb_service_1.getDbNotifications.mockResolvedValue([]);
            notificationDb_service_1.getUnreadNotificationCount.mockResolvedValue(0);
            yield (0, notificationApi_controller_1.getMyNotifications)(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                messages: [],
                unreadCount: 0,
            });
        }));
    });
    // --- Tests for markNotificationRead ---
    describe("markNotificationRead", () => {
        const mockNotificationId = BigInt(789);
        it("should mark a notification as read successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            req.user = { id: mockUserEmpNo };
            req.params = { id: mockNotificationId.toString() };
            notificationDb_service_1.markDbNotificationAsRead.mockResolvedValue(true); // Service returns true on success
            yield (0, notificationApi_controller_1.markNotificationRead)(req, res);
            expect(notificationDb_service_1.markDbNotificationAsRead).toHaveBeenCalledWith(mockNotificationId, mockUserEmpNo);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Notification marked as read",
            });
        }));
        it("should return 401 if user is not authenticated", () => __awaiter(void 0, void 0, void 0, function* () {
            req.user = null; // No user
            req.params = { id: mockNotificationId.toString() };
            yield (0, notificationApi_controller_1.markNotificationRead)(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Unauthorized: User not authenticated",
            });
            expect(notificationDb_service_1.markDbNotificationAsRead).not.toHaveBeenCalled();
        }));
        it("should return 404 if notification not found or already read", () => __awaiter(void 0, void 0, void 0, function* () {
            req.user = { id: mockUserEmpNo };
            req.params = { id: mockNotificationId.toString() };
            notificationDb_service_1.markDbNotificationAsRead.mockResolvedValue(false); // Service returns false
            yield (0, notificationApi_controller_1.markNotificationRead)(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Notification not found or already read",
            });
        }));
        it("should handle errors when marking notification as read", () => __awaiter(void 0, void 0, void 0, function* () {
            req.user = { id: mockUserEmpNo };
            req.params = { id: mockNotificationId.toString() };
            const error = new Error("DB update failed");
            notificationDb_service_1.markDbNotificationAsRead.mockRejectedValue(error);
            yield (0, notificationApi_controller_1.markNotificationRead)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Failed to mark notification as read",
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error marking notification as read:", error);
        }));
        it("should handle BigInt conversion error for notification ID", () => __awaiter(void 0, void 0, void 0, function* () {
            req.user = { id: mockUserEmpNo };
            req.params = { id: "abc" }; // Invalid ID for BigInt
            yield (0, notificationApi_controller_1.markNotificationRead)(req, res);
            // The BigInt('abc') will throw a SyntaxError, caught by the generic catch
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: `Invalid notification ID format: 'abc'. Must be a numeric ID.`,
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid notification ID format 'abc':", expect.any(SyntaxError));
        }));
    });
    // --- Tests for markAllNotificationsRead ---
    describe("markAllNotificationsRead", () => {
        it("should mark all notifications as read successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            // Note: Controller uses req.user.emp_no, but tests use req.user.id for consistency.
            // Adjust your controller or tests if req.user structure is different.
            // For this test, assuming req.user = { id: 'someId', emp_no: mockUserEmpNo }
            // Or simplify and assume req.user.id IS the emp_no.
            // The controller uses req.user.emp_no for markAll, but req.user.id for the others. This might be an inconsistency.
            // For the test, let's align with the controller's usage for this specific function.
            req.user = { emp_no: mockUserEmpNo, id: "someOtherId" }; // Matching controller's req.user.emp_no
            const mockUpdateCount = 3;
            notificationDb_service_1.markAllDbNotificationsAsRead.mockResolvedValue(mockUpdateCount);
            yield (0, notificationApi_controller_1.markAllNotificationsRead)(req, res);
            expect(notificationDb_service_1.markAllDbNotificationsAsRead).toHaveBeenCalledWith(mockUserEmpNo);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: `Marked ${mockUpdateCount} notifications as read.`,
            });
        }));
        it("should return 401 if user is not authenticated", () => __awaiter(void 0, void 0, void 0, function* () {
            req.user = null; // No user
            yield (0, notificationApi_controller_1.markAllNotificationsRead)(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Unauthorized: User not authenticated",
            });
            expect(notificationDb_service_1.markAllDbNotificationsAsRead).not.toHaveBeenCalled();
        }));
        it("should handle case where no notifications were updated", () => __awaiter(void 0, void 0, void 0, function* () {
            req.user = { emp_no: mockUserEmpNo, id: "someOtherId" };
            notificationDb_service_1.markAllDbNotificationsAsRead.mockResolvedValue(0);
            yield (0, notificationApi_controller_1.markAllNotificationsRead)(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: `Marked 0 notifications as read.`,
            });
        }));
        it("should handle errors when marking all notifications as read", () => __awaiter(void 0, void 0, void 0, function* () {
            req.user = { emp_no: mockUserEmpNo, id: "someOtherId" };
            const error = new Error("DB mass update failed");
            notificationDb_service_1.markAllDbNotificationsAsRead.mockRejectedValue(error);
            yield (0, notificationApi_controller_1.markAllNotificationsRead)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Failed to mark all notifications as read",
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error marking all notifications as read:", error);
        }));
    });
});
