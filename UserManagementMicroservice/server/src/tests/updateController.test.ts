import { Request, Response } from "express";
// For Jest's SpiedFunction type, direct import or rely on globals if tsconfig is set
// import { SpiedFunction } from 'jest-mock';
import { updateController } from "../controllers/updateController.controller"; // Adjust path
import prisma from "../config/database.config"; // Will be mocked

// --- Mock Prisma ---
// We define the structure of our prisma mock more explicitly here
// This helps TypeScript understand the types of the mocked functions better.
type PrismaMock = {
  appUser: {
    findUnique: jest.Mock<
      Promise<{ emp_no: bigint; role: string } | null>,
      [any]
    >;
  };
  drm: {
    update: jest.Mock<Promise<any>, [any]>;
  };
  arm: {
    update: jest.Mock<Promise<any>, [any]>;
  };
};

// Actual mock implementation
jest.mock("../config/database.config", () => ({
  __esModule: true,
  default: {
    appUser: {
      findUnique: jest.fn(),
    },
    drm: {
      update: jest.fn(),
    },
    arm: {
      update: jest.fn(),
    },
  },
}));

// --- Helper Functions (same as before) ---
const mockRequest = (params = {}, body = {}) =>
  ({
    params,
    body,
  } as unknown as Request);

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// --- Type Cast for Prisma Mock (to use in tests with type safety) ---
const prismaMock = prisma as unknown as PrismaMock;

// --- Test Suite ---
describe("Update Controller (Simplified)", () => {
  let req: Request;
  let res: Response;
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>; // Or SpyInstance
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>; // Or SpyInstance

  beforeEach(() => {
    jest.clearAllMocks(); // Resets all mocks, including those on prismaMock
    req = mockRequest();
    res = mockResponse();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  const empNo = "12345";
  const empNoBigInt = BigInt(empNo);
  const updatePayload = {
    designation: "Senior Developer",
    tele_no: "1234567890",
    mob_no: "0987654321",
  };

  it("should return 400 if required fields are missing", async () => {
    req.params = { empNo };
    req.body = { designation: "Test" }; // Missing fields

    await updateController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing required fields.",
    });
  });

  it("should return 404 if user is not found", async () => {
    req.params = { empNo };
    req.body = updatePayload;
    prismaMock.appUser.findUnique.mockResolvedValue(null);

    await updateController(req, res);

    expect(prismaMock.appUser.findUnique).toHaveBeenCalledWith({
      where: { emp_no: empNoBigInt },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: `User not found for employee number ${empNo}.`,
    });
  });

  it("should update DRM user details successfully", async () => {
    req.params = { empNo };
    req.body = updatePayload;
    const mockUser = { emp_no: empNoBigInt, role: "DRM" };
    prismaMock.appUser.findUnique.mockResolvedValue(mockUser);
    prismaMock.drm.update.mockResolvedValue({}); // Mock successful update

    await updateController(req, res);

    expect(prismaMock.drm.update).toHaveBeenCalledWith({
      where: { emp_no: empNoBigInt },
      data: {
        desig: updatePayload.designation,
        tele_no: updatePayload.tele_no,
        mob_no: updatePayload.mob_no,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: `DRM details updated successfully for employee number ${empNo}.`,
    });
  });

  it("should update ARM user details successfully", async () => {
    req.params = { empNo };
    req.body = updatePayload;
    const mockUser = { emp_no: empNoBigInt, role: "ARM" };
    prismaMock.appUser.findUnique.mockResolvedValue(mockUser);
    prismaMock.arm.update.mockResolvedValue({}); // Mock successful update

    await updateController(req, res);

    expect(prismaMock.arm.update).toHaveBeenCalledWith({
      where: { emp_no: empNoBigInt },
      data: {
        desig: updatePayload.designation,
        tele_no: updatePayload.tele_no,
        mob_no: updatePayload.mob_no,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: `ARM details updated successfully for employee number ${empNo}.`,
    });
  });

  it("should return 404 if user role is not DRM or ARM", async () => {
    req.params = { empNo };
    req.body = updatePayload;
    const mockUser = { emp_no: empNoBigInt, role: "HOD" }; // Different role
    prismaMock.appUser.findUnique.mockResolvedValue(mockUser);

    await updateController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: `No DRM and ARM found for employee number ${empNo}.`,
    });
    expect(prismaMock.drm.update).not.toHaveBeenCalled();
    expect(prismaMock.arm.update).not.toHaveBeenCalled();
  });

  it("should return 500 on BigInt conversion error", async () => {
    req.params = { empNo: "abc" }; // Invalid empNo
    req.body = updatePayload;
    // BigInt(empNo) in controller will throw before DB call

    await updateController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error.",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(SyntaxError));
  });

  it("should return 500 on database error during findUnique", async () => {
    req.params = { empNo };
    req.body = updatePayload;
    const dbError = new Error("DB findUnique failed");
    prismaMock.appUser.findUnique.mockRejectedValue(dbError);

    await updateController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error.",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(dbError);
  });

  it("should return 500 on database error during DRM update", async () => {
    req.params = { empNo };
    req.body = updatePayload;
    const mockUser = { emp_no: empNoBigInt, role: "DRM" };
    prismaMock.appUser.findUnique.mockResolvedValue(mockUser);
    const dbError = new Error("DB DRM update failed");
    prismaMock.drm.update.mockRejectedValue(dbError);

    await updateController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error.",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(dbError);
  });
});
