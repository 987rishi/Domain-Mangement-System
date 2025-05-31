import { Request, Response, NextFunction } from "express";
import prisma from "../config/database.config";
import { Role } from "@prisma/client"; // Assuming Role is correctly imported in controller
import * as userController from "../controllers/userController.controller";
import { getRoleInfo,
    stringifyBigInts
 } from "../utils/userController.helper"; // stringifyBigInts is used internally

// Mock Prisma
jest.mock("../config/database.config", () => ({
  __esModule: true,
  default: {
    appUser: {
      findUnique: jest.fn(),
    },
    projectAssignment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    centre: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    groupDepartment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    // Mock role-specific models that getRoleInfo might return
    // These are illustrative; you'd mock specific ones used in tests
    drm: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    arm: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    hod: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    memberNetops: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    edCentreHead: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    webMaster: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    hodHpcIandE: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Mock helper functions
// We will use the actual stringifyBigInts, so no need to mock it here unless specific behavior is needed.
// The controller imports stringifyBigInts directly.
const actualUserControllerHelper = jest.requireActual(
  "../utils/userController.helper"
);
// jest.mock("../utils/userController.helper", () => ({
//   __esModule: true,
//   getRoleInfo: jest.fn(),
//   stringifyBigInts: jest.fn(actualUserControllerHelper.stringifyBigInts), // Use actual implementation
// }));
jest.mock("../utils/userController.helper", () => {
  // Dynamically require the actual module INSIDE the mock factory
  const originalModule = jest.requireActual("../utils/userController.helper");
  return {
    __esModule: true,
    getRoleInfo: jest.fn(), // This will be a mock
    // Use the actual stringifyBigInts from the original module
    stringifyBigInts: jest.fn(originalModule.stringifyBigInts), // Now originalModule is defined
    // If stringifyBigInts itself doesn't need to be a jest.fn() wrapper
    // and you just want to use the original directly while mocking others:
    // stringifyBigInts: originalModule.stringifyBigInts,
  };
});

// Helper to create mock Express objects
const mockRequest = (params = {}, body = {}, query = {}) =>
  ({
    params,
    body,
    query,
  } as unknown as Request);

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Global mock objects for tests
let req: Request;
let res: Response;
let next: NextFunction;

describe("User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clears all mock usage data between tests
    req = mockRequest();
    res = mockResponse();
    next = jest.fn() as NextFunction;
  });

  // --- getUserDetails ---
  describe("getUserDetails", () => {
    it("should return user details for a valid empNo", async () => {
      const empNo = "12345";
      const mockUserData = {
        emp_no: BigInt(empNo),
        name: "Test User",
        is_active: true,
      };
      req.params = { empNo };
      (prisma.appUser.findUnique as jest.Mock).mockResolvedValue(mockUserData);

      await userController.getUserDetails(req, res);

      expect(prisma.appUser.findUnique).toHaveBeenCalledWith({
        where: { emp_no: BigInt(empNo) },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        actualUserControllerHelper.stringifyBigInts(mockUserData)
      );
    });

    it("should return 400 if empNo is not provided", async () => {
      req.params = {}; // empNo is missing
      await userController.getUserDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid employee number.",
      });
    });

    it("should return 404 if user is not found", async () => {
      const empNo = "12345";
      req.params = { empNo };
      (prisma.appUser.findUnique as jest.Mock).mockResolvedValue(null);

      await userController.getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: `User details not found for employee number '${empNo}'.`,
      });
    });

    // it("should return 400 on prisma error", async () => {
    //   const empNo = "12345"
    //   req.params = { empNo };
    //   const error = new Error("DB Error");
    //   (prisma.appUser.findUnique as jest.Mock).mockRejectedValue(error);

    //   await userController.getUserDetails(req, res);

    //   expect(res.status).toHaveBeenCalledWith(400);
    //   expect(res.json).toHaveBeenCalledWith({
    //     message: "Internal Server error in fetching details from user service",
    //   });
    //   expect(console.log).toHaveBeenCalledWith(error);
    // });
  });

  // --- getUserDetailsByRole ---
  describe("getUserDetailsByRole", () => {
    const mockEmpNo = "123";
    const mockEmpNoBigInt = BigInt(mockEmpNo);

    it("should return user details for a valid role and empNo", async () => {
      req.params = { role: "DRM", empNo: mockEmpNo };
      const mockRoleUserDetails = {
        emp_no: mockEmpNoBigInt,
        specific_role_data: "data",
        is_active: true,
      };
      const mockRolePrismaAccessor = {
        findUnique: jest.fn().mockResolvedValue(mockRoleUserDetails),
      };
      (getRoleInfo as jest.Mock).mockReturnValue(mockRolePrismaAccessor);

      await userController.getUserDetailsByRole(req, res, next);

      expect(getRoleInfo).toHaveBeenCalledWith("DRM");
      expect(mockRolePrismaAccessor.findUnique).toHaveBeenCalledWith({
        where: { emp_no: mockEmpNoBigInt },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        actualUserControllerHelper.stringifyBigInts(mockRoleUserDetails)
      );
    });

    it("should return 400 if role is invalid", async () => {
      req.params = { role: "INVALID_ROLE", empNo: mockEmpNo };
      (getRoleInfo as jest.Mock).mockReturnValue(null);

      await userController.getUserDetailsByRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid role specified.",
      });
    });

    it("should return 404 if user details are not found for role/empNo", async () => {
      req.params = { role: "DRM", empNo: mockEmpNo };
      const mockRolePrismaAccessor = {
        findUnique: jest.fn().mockResolvedValue(null),
      };
      (getRoleInfo as jest.Mock).mockReturnValue(mockRolePrismaAccessor);

      await userController.getUserDetailsByRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: `User details not found for role 'DRM' and employee number '${mockEmpNo}'.`,
      });
    });

    it("should return 404 if user role record is inactive", async () => {
      req.params = { role: "DRM", empNo: mockEmpNo };
      const mockRoleUserDetails = {
        emp_no: mockEmpNoBigInt,
        specific_role_data: "data",
        is_active: false,
      };
      const mockRolePrismaAccessor = {
        findUnique: jest.fn().mockResolvedValue(mockRoleUserDetails),
      };
      (getRoleInfo as jest.Mock).mockReturnValue(mockRolePrismaAccessor);

      await userController.getUserDetailsByRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: `User details not found for role 'DRM' and employee number '${mockEmpNo}' (user may be inactive).`,
      });
    });

    it("should return 404 if base user (if included) is inactive", async () => {
      req.params = { role: "DRM", empNo: mockEmpNo };
      const mockRoleUserDetails = {
        emp_no: mockEmpNoBigInt,
        specific_role_data: "data",
        is_active: true, // Role record itself is active
        user: { is_active: false }, // But base user is inactive
      };
      const mockRolePrismaAccessor = {
        findUnique: jest.fn().mockResolvedValue(mockRoleUserDetails),
      };
      (getRoleInfo as jest.Mock).mockReturnValue(mockRolePrismaAccessor);

      await userController.getUserDetailsByRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: `User details not found for role 'DRM' and employee number '${mockEmpNo}' (user may be inactive).`,
      });
    });

    // it("should return 400 for invalid employee number format", async () => {
    //   req.params = { role: "DRM", empNo: "abc" }; // Invalid BigInt
    //   const mockRolePrismaAccessor = { findUnique: jest.fn() }; // Won't be called
    //   (getRoleInfo as jest.Mock).mockReturnValue(mockRolePrismaAccessor);
    //   // Simulate BigInt conversion error
    //   // The controller's try-catch will handle this. BigInt('abc') throws an error.
    //   // We can't directly mock BigInt constructor, so we test the error path.

    //   // To make the test more direct for this specific error message,
    //   // we can make the prisma call throw an error that includes "Cannot convert"
    //   (mockRolePrismaAccessor.findUnique as jest.Mock).mockImplementation(
    //     () => {
    //       throw new Error("Cannot convert abc to a BigInt");
    //     }
    //   );
    //   // Or, more simply, BigInt(empNo) will throw before prisma call in the controller
    //   // The provided controller code has BigInt(empNo) at the start.

    //   await userController.getUserDetailsByRole(req, res, next);
    //   // The controller has a specific catch for this
    //   // if (error instanceof Error && error.message.includes("Cannot convert"))
    //   // However, BigInt() throws a SyntaxError, not Error with "Cannot convert" string.
    //   // Let's test what the current code does. SyntaxError: Cannot convert abc to a BigInt

    //   // If we want to test the *specific* error message "Invalid employee number format."
    //   // the error thrown should match: `error.message.includes("Cannot convert")`
    //   // Let's assume the internal BigInt conversion fails and leads to the generic next(error) for now.
    //   // The code actually has: const empNoBigInt = BigInt(empNo);
    //   // If this fails, it will go to the outer catch block.
    //   // The specific catch `error.message.includes("Cannot convert")` is inside the main try block.
    //   // This means it's intended for errors from Prisma with BigInts, not the initial conversion.
    //   // Let's simulate the BigInt constructor error.

    //   // To properly test this, we need to ensure BigInt(empNo) throws.
    //   // This will be caught by the generic catch block.
    //   const error = new SyntaxError("Cannot convert abc to a BigInt");
    //   try {
    //     BigInt("abc");
    //   } catch (e) {
    //     // This is just to show how the error occurs, the test will rely on the controller's behavior
    //   }

    //   // For the specific "Invalid employee number format." message, the prisma call would need to throw that.
    //   // Let's assume the controller's initial BigInt(empNo) throws.
    //   // This scenario isn't perfectly covered by the specific catch in the controller.
    //   // Let's test the generic error path.
    //   const genericError = new Error("Some other issue");
    //   (getRoleInfo as jest.Mock).mockImplementation(() => {
    //     throw genericError;
    //   }); // Simulate error earlier

    //   await userController.getUserDetailsByRole(req, res, next);
    //   expect(next).toHaveBeenCalledWith(genericError);
    // });

    it("should call next(error) on other Prisma errors", async () => {
      req.params = { role: "DRM", empNo: mockEmpNo };
      const error = new Error("DB Read Error");
      const mockRolePrismaAccessor = {
        findUnique: jest.fn().mockRejectedValue(error),
      };
      (getRoleInfo as jest.Mock).mockReturnValue(mockRolePrismaAccessor);

      await userController.getUserDetailsByRole(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // --- getUserListByRole ---
  describe("getUserListByRole", () => {
    it("should return a list of active users for a valid role", async () => {
      req.params = { role: "HOD" };
      const mockUserList = [
        { emp_no: BigInt(1), name: "Hod 1" },
        { emp_no: BigInt(2), name: "Hod 2" },
      ];
      const mockRolePrismaAccessor = {
        findMany: jest.fn().mockResolvedValue(mockUserList),
      };
      (getRoleInfo as jest.Mock).mockReturnValue(mockRolePrismaAccessor);

      await userController.getUserListByRole(req, res, next);

      expect(getRoleInfo).toHaveBeenCalledWith("HOD");
      expect(mockRolePrismaAccessor.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        orderBy: { emp_no: "asc" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        actualUserControllerHelper.stringifyBigInts(mockUserList)
      );
    });

    it("should return 400 if role is invalid", async () => {
      req.params = { role: "INVALID_ROLE" };
      (getRoleInfo as jest.Mock).mockReturnValue(null);

      await userController.getUserListByRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid role specified.",
      });
    });

    it("should call next(error) on Prisma error", async () => {
      req.params = { role: "HOD" };
      const error = new Error("DB List Error");
      const mockRolePrismaAccessor = {
        findMany: jest.fn().mockRejectedValue(error),
      };
      (getRoleInfo as jest.Mock).mockReturnValue(mockRolePrismaAccessor);

      await userController.getUserListByRole(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // --- getCentreList ---
  describe("getCentreList", () => {
    it("should return centre details for a valid centreid", async () => {
      const centreid = "1";
      req.params = { centreid };
      const mockCentre = { centre_id: 1, name: "Test Centre" };
      (prisma.centre.findUnique as jest.Mock).mockResolvedValue(mockCentre);

      await userController.getCentreList(req, res);

      expect(prisma.centre.findUnique).toHaveBeenCalledWith({
        where: { centre_id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCentre); // Assumes centre doesn't have BigInts needing stringify
    });

    it("should return 404 if centre is not found", async () => {
      const centreid = "99";
      req.params = { centreid };
      (prisma.centre.findUnique as jest.Mock).mockResolvedValue(null);

      await userController.getCentreList(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Centre not found." });
    });

    it("should return 400 if centreid is invalid or prisma fails", async () => {
      const centreid = "abc"; // Invalid for parseInt
      req.params = { centreid };
      // parseInt('abc') is NaN. Prisma call might not even happen or might fail.
      // The code's catch block sends 400.
      (prisma.centre.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB error")
      );

      await userController.getCentreList(req, res);
      // If parseInt fails and leads to prisma error due to NaN, or prisma itself errors
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        `No centre found for centre_id ${centreid}`
      );
    });
  });

  // --- getGroupList ---
  describe("getGroupList", () => {
    it("should return group details for a valid groupid", async () => {
      const groupid = "1";
      req.params = { groupid };
      const mockGroup = { dept_id: 1, name: "Test Group" };
      (prisma.groupDepartment.findUnique as jest.Mock).mockResolvedValue(
        mockGroup
      );

      await userController.getGroupList(req, res);

      expect(prisma.groupDepartment.findUnique).toHaveBeenCalledWith({
        where: { dept_id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGroup);
    });

    it("should return 404 if group is not found", async () => {
      const groupid = "99";
      req.params = { groupid };
      (prisma.groupDepartment.findUnique as jest.Mock).mockResolvedValue(null);

      await userController.getGroupList(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Group not found." });
    });

    it("should return 400 if groupid is invalid or prisma fails", async () => {
      const groupid = "xyz";
      req.params = { groupid };
      (prisma.groupDepartment.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB error")
      );

      await userController.getGroupList(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        `No group found for group_id ${groupid}`
      );
    });
  });

  // --- getAllGroupList ---
  describe("getAllGroupList", () => {
    it("should return a list of all groups", async () => {
      const mockGroups = [
        { dept_id: 1, name: "Group 1" },
        { dept_id: 2, name: "Group 2" },
      ];
      (prisma.groupDepartment.findMany as jest.Mock).mockResolvedValue(
        mockGroups
      );

      await userController.getAllGroupList(req, res);

      expect(prisma.groupDepartment.findMany).toHaveBeenCalledWith({
        orderBy: { dept_id: "asc" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGroups);
    });

    it("should return 200 with an empty list if no groups are found", async () => {
      (prisma.groupDepartment.findMany as jest.Mock).mockResolvedValue([]);
      await userController.getAllGroupList(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
      // The `if (!allGroups)` check in the original code for findMany is misleading.
      // `findMany` returns `[]`, so `![]` is false. The 400 error path there is unlikely.
    });

    it("should return 500 on prisma error", async () => {
      (prisma.groupDepartment.findMany as jest.Mock).mockRejectedValue(
        new Error("DB Error")
      );
      await userController.getAllGroupList(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        "An error occurred while retrieving groups"
      );
    });
  });

  // --- getAllCentreList ---
  describe("getAllCentreList", () => {
    it("should return a list of all centres", async () => {
      const mockCentres = [
        { centre_id: 1, name: "Centre A" },
        { centre_id: 2, name: "Centre B" },
      ];
      (prisma.centre.findMany as jest.Mock).mockResolvedValue(mockCentres);

      await userController.getAllCentreList(req, res);

      expect(prisma.centre.findMany).toHaveBeenCalledWith({
        orderBy: { centre_id: "asc" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCentres);
    });

    it("should return 200 with an empty list if no centres are found", async () => {
      (prisma.centre.findMany as jest.Mock).mockResolvedValue([]);
      await userController.getAllCentreList(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should return 500 on prisma error", async () => {
      (prisma.centre.findMany as jest.Mock).mockRejectedValue(
        new Error("DB Error")
      );
      await userController.getAllCentreList(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        "An error occurred while retrieving groups"
      ); // Typo in original code's error message
    });
  });

  // --- getResponsibleOfficials ---
  describe("getResponsibleOfficials", () => {
    const empNo = "1001";
    const empNoBigInt = BigInt(empNo);
    const mockUserDRM = { emp_no: empNoBigInt, role: Role.DRM };
    const mockUserARM = { emp_no: empNoBigInt, role: Role.ARM };
    const mockDrmDetails = { centre_id: 1, grp_id: 10, is_active: true };
    const mockArmDetails = { centre_id: 2, grp_id: 20, is_active: true };

    const mockHod = {
      emp_no: BigInt("2001"),
      hod_fname: "HOD",
      hod_lname: "User",
      email_id: "hod@test.com",
    };
    const mockNetops = {
      emp_no: BigInt("3001"),
      fname: "NetOps",
      lname: "User",
      email_id: "netops@test.com",
      is_active: true,
    };
    const mockEd = {
      emp_no: BigInt("4001"),
      fname: "ED",
      lname: "User",
      email_id: "ed@test.com",
      is_active: true,
    };
    const mockWebmaster = {
      emp_no: BigInt("5001"),
      fname: "Webmaster",
      lname: "User",
      email_id: "webmaster@test.com",
    };
    const mockHodHpc = {
      emp_no: BigInt("6001"),
      fname: "HODHPC",
      lname: "User",
      email_id: "hodhpc@test.com",
    };

    beforeEach(() => {
      (prisma.appUser.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.drm.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.arm.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.hod.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.memberNetops.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.edCentreHead.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.webMaster.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.hodHpcIandE.findFirst as jest.Mock).mockResolvedValue(null);
    });

    it("should return officials for a DRM user", async () => {
      req.params = { empNo };
      (prisma.appUser.findUnique as jest.Mock).mockResolvedValue(mockUserDRM);
      (prisma.drm.findUnique as jest.Mock).mockResolvedValue(mockDrmDetails);
      (prisma.hod.findFirst as jest.Mock).mockResolvedValue(mockHod);
      (prisma.memberNetops.findUnique as jest.Mock).mockResolvedValue(
        mockNetops
      );
      (prisma.edCentreHead.findUnique as jest.Mock).mockResolvedValue(mockEd);
      (prisma.webMaster.findFirst as jest.Mock).mockResolvedValue(
        mockWebmaster
      );
      (prisma.hodHpcIandE.findFirst as jest.Mock).mockResolvedValue(mockHodHpc);

      await userController.getResponsibleOfficials(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        actualUserControllerHelper.stringifyBigInts({
          requestingUserRole: Role.DRM,
          hod: mockHod,
          netops: mockNetops,
          ed: mockEd,
          webmaster: mockWebmaster,
          hodHpcIandE: mockHodHpc,
        })
      );
      expect(prisma.hod.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            grp_id: mockDrmDetails.grp_id,
            centre_id: mockDrmDetails.centre_id,
            is_active:true,
          },
        })
      );
      expect(prisma.memberNetops.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { centre_id: mockDrmDetails.centre_id },
        })
      );
    });

    it("should return 404 if user not found", async () => {
      req.params = { empNo };
      (prisma.appUser.findUnique as jest.Mock).mockResolvedValue(null);
      await userController.getResponsibleOfficials(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found." });
    });

    it("should return 404 if DRM is not active", async () => {
      req.params = { empNo };
      (prisma.appUser.findUnique as jest.Mock).mockResolvedValue(mockUserDRM);
      (prisma.drm.findUnique as jest.Mock).mockResolvedValue({
        ...mockDrmDetails,
        is_active: false,
      });
      await userController.getResponsibleOfficials(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "DRM is not active." });
    });

    it("should return 404 if ARM is not active (testing actual error message)", async () => {
      req.params = { empNo };
      (prisma.appUser.findUnique as jest.Mock).mockResolvedValue(mockUserARM); // User is ARM
      (prisma.arm.findUnique as jest.Mock).mockResolvedValue({
        ...mockArmDetails,
        is_active: false,
      }); // ARM record inactive

      await userController.getResponsibleOfficials(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      // The original code has a typo here, it says "DRM is not active." for an inactive ARM.
      expect(res.json).toHaveBeenCalledWith({ error: "DRM is not active." });
    });

    it("should return 400 if user role is not DRM or ARM", async () => {
      req.params = { empNo };
      (prisma.appUser.findUnique as jest.Mock).mockResolvedValue({
        emp_no: empNoBigInt,
        role: "OTHER_ROLE" as Role,
      });
      await userController.getResponsibleOfficials(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only DRM or ARM roles are supported.",
      });
    });

    it("should return null for officials if not found or inactive", async () => {
      req.params = { empNo };
      (prisma.appUser.findUnique as jest.Mock).mockResolvedValue(mockUserDRM);
      (prisma.drm.findUnique as jest.Mock).mockResolvedValue(mockDrmDetails);
      (prisma.hod.findFirst as jest.Mock).mockResolvedValue(null); // HOD not found
      (prisma.memberNetops.findUnique as jest.Mock).mockResolvedValue({
        ...mockNetops,
        is_active: false,
      }); // NetOps inactive
      (prisma.edCentreHead.findUnique as jest.Mock).mockResolvedValue(null); // ED not found
      (prisma.webMaster.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.hodHpcIandE.findFirst as jest.Mock).mockResolvedValue(null);

      await userController.getResponsibleOfficials(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        actualUserControllerHelper.stringifyBigInts({
          requestingUserRole: Role.DRM,
          hod: null,
          netops: null,
          ed: null,
          webmaster: null,
          hodHpcIandE: null,
        })
      );
    });

    it("should return 500 on general error", async () => {
      req.params = { empNo };
      (prisma.appUser.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );
      await userController.getResponsibleOfficials(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  // --- getProjectList ---
  describe("getProjectList", () => {
    const empNo = "789";
    const empNoBigInt = BigInt(empNo);
    const mockProjects = [
      { project_id: BigInt(1), name: "Project Alpha", drm_emp_no: empNoBigInt },
      { project_id: BigInt(2), name: "Project Beta", arm_emp_no: empNoBigInt },
    ];

    it("should return projects for a valid empNo", async () => {
      req.params = { empNo };
      (prisma.projectAssignment.findMany as jest.Mock).mockResolvedValue(
        mockProjects
      );

      await userController.getProjectList(req, res);

      expect(prisma.projectAssignment.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { hod_emp_no: empNoBigInt },
            { arm_emp_no: empNoBigInt },
            { drm_emp_no: empNoBigInt },
          ],
        },
        include: { drm: true, arm: true, hod: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        actualUserControllerHelper.stringifyBigInts(mockProjects)
      );
    });

    it("should return 400 if empNo is invalid (e.g., empty string that becomes 0n or NaN for BigInt)", async () => {
      // BigInt('') or BigInt(undefined) will throw.
      // The controller has `if(!employeeNo)` check, which covers BigInt(0).
      req.params = { empNo: "" };
      // BigInt('') throws SyntaxError. The controller's `if(!employeeNo)` is after BigInt conversion.
      // Let's test the `if(!employeeNo)` part by making BigInt return 0n
      // This test is slightly artificial for the if(!employeeNo) because BigInt('') throws.
      // A more direct test for if(!employeeNo) would be if empNo was '0'
      req.params = { empNo: "0" };
      await userController.getProjectList(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid employee number.",
      });

      // Test for empNo not provided at all (will be caught by BigInt failure if not by a specific check)
      // req.params = {}; // This would make empNo undefined, BigInt(undefined) throws
    });

    it("should return 404 if no projects are found", async () => {
      req.params = { empNo };
      (prisma.projectAssignment.findMany as jest.Mock).mockResolvedValue([]);
      await userController.getProjectList(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No projects found for employee number",
      });
    });

    it("should return 404 on Prisma error", async () => {
      req.params = { empNo };
      (prisma.projectAssignment.findMany as jest.Mock).mockRejectedValue(
        new Error("DB Error")
      );
      await userController.getProjectList(req, res);
      expect(res.status).toHaveBeenCalledWith(404); // Original code uses 404 for errors here
      expect(res.json).toHaveBeenCalledWith({
        message: "Error in fetching projects",
      });
    });
  });

  // --- getProjectDetails ---
  describe("getProjectDetails", () => {
    const projectId = "12345";
    const projectIdBigInt = BigInt(projectId);
    const mockHodDetails = {
      emp_no: BigInt("101"),
      centre_id: 1,
      is_active: true /* other HOD fields */,
    };
    const mockProject = {
      project_id: projectIdBigInt,
      name: "Super Project",
      hod: mockHodDetails,
      drm: { emp_no: BigInt("202") },
      arm: { emp_no: BigInt("303") },
    };
    const mockEd = { emp_no: BigInt("404"), is_active: true };
    const mockNetops = { emp_no: BigInt("505"), is_active: true };
    const mockWebmaster = { emp_no: BigInt("606") };
    const mockHodHpc = { emp_no: BigInt("707") };

    beforeEach(() => {
      (prisma.projectAssignment.findUnique as jest.Mock).mockResolvedValue(
        null
      );
      (prisma.edCentreHead.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.memberNetops.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.webMaster.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.hodHpcIandE.findFirst as jest.Mock).mockResolvedValue(null);
    });

    it("should return project details with responsible officials", async () => {
      req.params = { projectId };
      (prisma.projectAssignment.findUnique as jest.Mock).mockResolvedValue(
        mockProject
      );
      (prisma.edCentreHead.findUnique as jest.Mock).mockResolvedValue(mockEd);
      (prisma.memberNetops.findUnique as jest.Mock).mockResolvedValue(
        mockNetops
      );
      (prisma.webMaster.findFirst as jest.Mock).mockResolvedValue(
        mockWebmaster
      );
      (prisma.hodHpcIandE.findFirst as jest.Mock).mockResolvedValue(mockHodHpc);

      await userController.getProjectDetails(req, res);

      expect(prisma.projectAssignment.findUnique).toHaveBeenCalledWith({
        where: { project_id: projectIdBigInt },
        include: { drm: true, arm: true, hod: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        actualUserControllerHelper.stringifyBigInts({
          ...mockProject,
          responsibleOfficials: {
            hod_emp_no: mockHodDetails.emp_no,
            ed_emp_no: mockEd.emp_no,
            netops_emp_no: mockNetops.emp_no,
            webmaster_emp_no: mockWebmaster.emp_no,
            hod_hpc_iande_emp_no: mockHodHpc.emp_no,
          },
        })
      );
    });

    it("should return 404 if project not found (testing corrected logic for !projectDetails)", async () => {
      req.params = { projectId };
      (prisma.projectAssignment.findUnique as jest.Mock).mockResolvedValue(
        null
      ); // Simulate project not found

      await userController.getProjectDetails(req, res);

      // The original code has `if (!getProjectDetails)`, which is a bug.
      // Assuming corrected logic `if (!projectDetails)`
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Project not found." });
    });

    it("should return 404 if HOD details or centre_id are missing", async () => {
      req.params = { projectId };
      const projectWithoutHodCentre = {
        ...mockProject,
        hod: { emp_no: BigInt("101"), is_active: true /* centre_id missing */ },
      };
      (prisma.projectAssignment.findUnique as jest.Mock).mockResolvedValue(
        projectWithoutHodCentre
      );
      await userController.getProjectDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Associated HOD or Centre information missing for the project.",
      });
    });

    it("should return 404 if HOD is inactive", async () => {
      req.params = { projectId };
      const projectWithInactiveHod = {
        ...mockProject,
        hod: { ...mockHodDetails, is_active: false },
      };
      (prisma.projectAssignment.findUnique as jest.Mock).mockResolvedValue(
        projectWithInactiveHod
      );
      await userController.getProjectDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "The HOD associated with this project is inactive.",
      });
    });

    it("should handle null for optional officials if not found or inactive", async () => {
      req.params = { projectId };
      (prisma.projectAssignment.findUnique as jest.Mock).mockResolvedValue(
        mockProject
      );
      (prisma.edCentreHead.findUnique as jest.Mock).mockResolvedValue({
        ...mockEd,
        is_active: false,
      }); // ED inactive
      (prisma.memberNetops.findUnique as jest.Mock).mockResolvedValue(null); // NetOps not found
      (prisma.webMaster.findFirst as jest.Mock).mockResolvedValue(null); // Webmaster not found
      (prisma.hodHpcIandE.findFirst as jest.Mock).mockResolvedValue(null); // HOD HPC not found

      await userController.getProjectDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        actualUserControllerHelper.stringifyBigInts({
          ...mockProject,
          responsibleOfficials: {
            hod_emp_no: mockHodDetails.emp_no,
            ed_emp_no: null,
            netops_emp_no: null,
            webmaster_emp_no: null,
            hod_hpc_iande_emp_no: null,
          },
        })
      );
    });

    it("should return 404 on general prisma error", async () => {
      req.params = { projectId };
      (prisma.projectAssignment.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB connection issue")
      );
      await userController.getProjectDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(404); // As per original code's catch block
      expect(res.send).toHaveBeenCalledWith(
        `No project found for project_id ${projectId}`
      );
    });
  });
});
