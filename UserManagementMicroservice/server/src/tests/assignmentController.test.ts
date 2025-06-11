import { Request, Response } from "express";
import { Role } from "@prisma/client";
import { assignmentController } from "../controllers/assigmentController.controller";
import prisma from "../config/database.config";
import { findUserByIdentifier } from "../services/ldapAuth";
import { assignmentSchemaValidation } from "../middleware/schemaValidation";
import { formatError } from "../utils/helper";
import axios from "axios";
import { findNotificationServiceUrl } from "../services/notificationSender";

// --- Mock External Services & Middleware ---

// Mock the axios library to control network calls
jest.mock("axios");

// Mock the new notification service URL finder
jest.mock("../services/notificationSender", () => ({
  findNotificationServiceUrl: jest.fn(),
}));

// Mock the LDAP service
jest.mock("../services/ldapAuth", () => ({
  findUserByIdentifier: jest.fn(),
}));

// Mock the Zod schema validation middleware
jest.mock("../middleware/schemaValidation", () => ({
  assignmentSchemaValidation: {
    safeParse: jest.fn(),
  },
}));

// Use the actual implementation for the BigInt stringifier
const { stringifyBigInts } = jest.requireActual(
  "../utils/userController.helper"
);

// --- Mock Prisma ---
// This object represents the transactional Prisma client (`tx`)
const mockTx = {
  hod: { findUnique: jest.fn() },
  appUser: { findUnique: jest.fn(), create: jest.fn() },
  drm: { findUnique: jest.fn(), create: jest.fn() },
  arm: { findUnique: jest.fn(), create: jest.fn() },
  projectAssignment: { create: jest.fn() },
};

// Mock the main Prisma client, specifically its $transaction method
jest.mock("../config/database.config", () => ({
  __esModule: true,
  default: {
    $transaction: jest
      .fn()
      .mockImplementation(async (callback) => callback(mockTx)),
  },
}));

// --- Helper Functions for Mocking Express ---
const mockRequest = (body = {}, user: any = null, params = {}) =>
  ({
    body,
    user,
    params,
  } as unknown as Request);

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// --- Test Suite ---
describe("Assignment Controller", () => {
  let req: Request;
  let res: Response;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;

  // --- Common Test Data ---
  const hodEmpNo = "1000";
  const drmEmpNoStr = "2001";
  const armEmpNoStr = "3002";
  const drmEmpNoNum = Number(drmEmpNoStr);
  const armEmpNoNum = Number(armEmpNoStr);
  const MOCK_WEBHOOK_URL = "http://mock-notification-service.com/api/notify";

  const mockValidPayload = {
    project_name: "Test Project",
    project_remarks: "Some remarks",
    drm_emp_no: drmEmpNoStr,
    arm_emp_no: armEmpNoStr,
  };

  const mockHodRecord = {
    emp_no: BigInt(hodEmpNo),
    centre_id: 1,
    grp_id: 10,
  };

  const mockLdapDataDrm = {
    employeeEmail: "drm@example.com",
    fullName: "DRM User Test",
  };
  const mockLdapDataArm = {
    employeeEmail: "arm@example.com",
    fullName: "ARM User Test",
  };

  // --- Setup and Teardown ---
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default successful mock behaviors for the "happy path"
    (axios.post as jest.Mock).mockResolvedValue({ data: "Webhook success" });
    (findNotificationServiceUrl as jest.Mock).mockResolvedValue(
      MOCK_WEBHOOK_URL
    );
    (assignmentSchemaValidation.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: mockValidPayload,
    });
    mockTx.hod.findUnique.mockResolvedValue(mockHodRecord);
    mockTx.projectAssignment.create.mockResolvedValue({ id: BigInt(1) });

    // Mock Express request and response objects
    req = mockRequest();
    res = mockResponse();

    // Spy on console methods to assert logging behavior
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original console methods
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  // --- Test Cases ---

  it("should return 500 if finding the notification service URL fails", async () => {
    const serviceUrlError = new Error("Service discovery failed");
    (findNotificationServiceUrl as jest.Mock).mockRejectedValue(
      serviceUrlError
    );

    req.body = mockValidPayload;
    req.user = { id: hodEmpNo };

    await assignmentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: serviceUrlError.message });

    // Ensure no subsequent logic was executed
    expect(assignmentSchemaValidation.safeParse).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("should return 422 if payload validation fails", async () => {
    const validationError = {
      issues: [{ path: ["project_name"], message: "Required" }],
    };
    (assignmentSchemaValidation.safeParse as jest.Mock).mockReturnValue({
      success: false,
      error: validationError,
    });
    const mockFormattedErrors = [
      { field: "project_name", message: "Required" },
    ];
    jest
      .spyOn(require("../utils/helper"), "formatError")
      .mockReturnValueOnce(mockFormattedErrors);

    req.body = {};
    req.user = { id: hodEmpNo };

    await assignmentController(req, res);

    // Assert that the URL service was called, as it happens before validation
    expect(findNotificationServiceUrl).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: mockFormattedErrors,
    });

    // Assert that the main transaction and notification were not triggered
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("should return 401 if HOD emp_no is not on req.user", async () => {
    req.body = mockValidPayload;
    req.user = null; // No user on request

    await assignmentController(req, res);

    expect(findNotificationServiceUrl).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not a valid Users" });
  });

  it("should assign project successfully when DRM/ARM are new, and send notification", async () => {
    req.body = mockValidPayload;
    req.user = { id: hodEmpNo };

    // Mock scenario where DRM and ARM are new users
    mockTx.appUser.findUnique.mockResolvedValue(null);
    (findUserByIdentifier as jest.Mock)
      .mockResolvedValueOnce(mockLdapDataDrm)
      .mockResolvedValueOnce(mockLdapDataArm);

    const mockAssignmentResult = {
      project_id: BigInt(123),
      project_name: mockValidPayload.project_name,
      project_remarks: mockValidPayload.project_remarks,
      hod_emp_no: BigInt(hodEmpNo),
      drm_emp_no: BigInt(drmEmpNoStr),
      arm_emp_no: BigInt(armEmpNoStr),
    };
    mockTx.projectAssignment.create.mockResolvedValue(mockAssignmentResult);

    await assignmentController(req, res);

    // 1. Assert the main business logic and response
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Project assigned successfully",
      result: stringifyBigInts(mockAssignmentResult),
    });
    expect(mockTx.appUser.create).toHaveBeenCalledTimes(2);
    expect(mockTx.drm.create).toHaveBeenCalledTimes(1);
    expect(mockTx.arm.create).toHaveBeenCalledTimes(1);

    // 2. Assert the notification side-effect
    expect(findNotificationServiceUrl).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      MOCK_WEBHOOK_URL,
      {
        eventType: "PROJECT_ASSIGNED",
        timestamp: expect.any(String),
        triggeredBy: { emp_no: Number(hodEmpNo), role: "HOD" },
        data: {
          domainName: mockValidPayload.project_name,
          remarks: mockValidPayload.project_remarks,
        },
        recipients: {
          drm_emp_no: drmEmpNoNum,
          arm_emp_no: armEmpNoNum,
        },
      },
      { headers: { "X-Webhook-Secret": "cdac@notificationSecret789" } }
    );
  });

  it("should still return 201 and log a warning if the webhook notification fails", async () => {
    req.body = mockValidPayload;
    req.user = { id: hodEmpNo };
    mockTx.hod.findUnique.mockResolvedValue(mockHodRecord);
    mockTx.appUser.findUnique.mockResolvedValue(null);
    // Mock that LDAP successfully finds the new users
    (findUserByIdentifier as jest.Mock)
      .mockResolvedValueOnce(mockLdapDataDrm)
      .mockResolvedValueOnce(mockLdapDataArm);

    const mockAssignmentResult = { project_id: BigInt(123) };
    mockTx.projectAssignment.create.mockResolvedValue(mockAssignmentResult);

    // Simulate the webhook POST call failing
    const webhookError = new Error("Network Error: ETIMEDOUT");
    (axios.post as jest.Mock).mockRejectedValue(webhookError);

    await assignmentController(req, res);

    // 1. Assert the user still gets a success response
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Project assigned successfully",
      result: stringifyBigInts(mockAssignmentResult),
    });

    // 2. Assert that the error was logged gracefully as a warning
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      "Webhook notification failed:",
      webhookError
    );
    expect(console.error).not.toHaveBeenCalled(); // No critical error should be logged
  });

  it("should return 500 if HOD is not found in the database", async () => {
    req.body = mockValidPayload;
    req.user = { id: hodEmpNo };

    // Simulate HOD not found inside the transaction
    mockTx.hod.findUnique.mockResolvedValue(null);

    await assignmentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "HOD not found in database",
    });

    // The transaction fails, so no notification should be sent
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("should return 500 if an existing ARM user is not active", async () => {
    req.body = mockValidPayload;
    req.user = { id: hodEmpNo };

    // Mock DRM is fine (e.g., a new user)
    mockTx.appUser.findUnique.mockResolvedValueOnce(null); // DRM is new
    (findUserByIdentifier as jest.Mock).mockResolvedValueOnce(mockLdapDataDrm); // LDAP finds DRM

    // Mock ARM exists but is inactive
    mockTx.appUser.findUnique.mockResolvedValueOnce({
      emp_no: armEmpNoNum,
      role: Role.ARM,
    });
    mockTx.arm.findUnique.mockResolvedValue({
      emp_no: armEmpNoNum,
      is_active: false,
    });

    await assignmentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: `ARM with emp_no ${armEmpNoNum} is not active.`,
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("should return 500 if LDAP lookup fails for a new user", async () => {
    req.body = mockValidPayload;
    req.user = { id: hodEmpNo };

    // Mock user is new
    mockTx.appUser.findUnique.mockResolvedValue(null);
    // Mock LDAP lookup fails
    (findUserByIdentifier as jest.Mock).mockResolvedValue(null);

    await assignmentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    // The error message comes from the throw inside the transaction
    expect(res.json).toHaveBeenCalledWith({
      message: `${drmEmpNoNum} not found in LDAP.`,
    });
    expect(axios.post).not.toHaveBeenCalled();
  });
});
