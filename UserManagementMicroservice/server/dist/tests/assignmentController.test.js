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
const client_1 = require("@prisma/client"); // Assuming Role is correctly imported by controller
const assigmentController_controller_1 = require("../controllers/assigmentController.controller"); // Adjust path
const ldapAuth_1 = require("../services/ldapAuth"); // To mock LDAP
const schemaValidation_1 = require("../middleware/schemaValidation"); // To mock validation
// --- Mock External Services & Middleware ---
jest.mock("../services/ldapAuth", () => ({
    findUserByIdentifier: jest.fn(),
}));
jest.mock("../middleware/schemaValidation", () => ({
    assignmentSchemaValidation: {
        safeParse: jest.fn(),
    },
}));
// If formatError is complex and not directly part of what you're testing in this controller,
// you could mock it too, otherwise, let its actual implementation run.
// jest.mock('../utils/helper', () => ({
//   formatError: jest.fn().mockReturnValue([{ path: 'test', message: 'Formatted test error' }]),
//   stringifyBigInts: jest.requireActual('../utils/userController.helper').stringifyBigInts // Assuming this is the one
// }));
// For stringifyBigInts, we'll use the actual one from userController.helper
const { stringifyBigInts } = jest.requireActual("../utils/userController.helper");
// --- Mock Prisma ---
// Define mock functions for prisma and the transactional client (tx)
const mockTx = {
    hod: { findUnique: jest.fn() },
    appUser: { findUnique: jest.fn(), create: jest.fn() },
    drm: { findUnique: jest.fn(), create: jest.fn() },
    arm: { findUnique: jest.fn(), create: jest.fn() },
    projectAssignment: { create: jest.fn() },
};
jest.mock("../config/database.config", () => ({
    __esModule: true,
    default: {
        // Mock the $transaction method
        $transaction: jest
            .fn()
            .mockImplementation((callback) => __awaiter(void 0, void 0, void 0, function* () { return callback(mockTx); })),
        // Individual models for direct calls if any (none in this controller's direct path)
        // hod: { findUnique: jest.fn() }, // etc.
    },
}));
// --- Helper Functions ---
const mockRequest = (body = {}, user = null, params = {}) => ({
    body,
    user, // For req.user
    params,
});
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
// --- Test Suite ---
describe("Assignment Controller", () => {
    let req;
    let res;
    let consoleErrorSpy;
    let consoleLogSpy;
    const hodEmpNo = "1000";
    const drmEmpNoStr = "2001";
    const armEmpNoStr = "3002";
    const drmEmpNoNum = Number(drmEmpNoStr);
    const armEmpNoNum = Number(armEmpNoStr);
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
        // ... other hod fields
    };
    const mockLdapDataDrm = {
        employeeEmail: "drm@example.com",
        fullName: "DRM User Test",
    };
    const mockLdapDataArm = {
        employeeEmail: "arm@example.com",
        fullName: "ARM User Test",
    };
    beforeEach(() => {
        jest.clearAllMocks();
        req = mockRequest();
        res = mockResponse();
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        // Default successful validation
        schemaValidation_1.assignmentSchemaValidation.safeParse.mockReturnValue({
            success: true,
            data: mockValidPayload,
        });
        // Default HOD found
        mockTx.hod.findUnique.mockResolvedValue(mockHodRecord);
        // Default project assignment creation success
        mockTx.projectAssignment.create.mockResolvedValue(Object.assign({ id: BigInt(1) }, mockValidPayload));
    });
    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });
    it("should return 422 if payload validation fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const validationError = {
            issues: [{ path: ["project_name"], message: "Required" }],
            // ... other Zod error structure if needed for formatError mock
        };
        schemaValidation_1.assignmentSchemaValidation.safeParse.mockReturnValue({
            success: false,
            error: validationError,
        });
        // If formatError is not mocked, this test might need actual Zod error for it to work
        // For simplicity, assuming formatError is robust or you mock it to return a simple array
        const mockFormattedErrors = [
            { field: "project_name", message: "Required" },
        ];
        jest
            .spyOn(require("../utils/helper"), "formatError")
            .mockReturnValueOnce(mockFormattedErrors);
        req.body = {}; // Invalid body
        req.user = { id: hodEmpNo };
        yield (0, assigmentController_controller_1.assignmentController)(req, res);
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: "Validation error",
            errors: mockFormattedErrors,
        });
    }));
    it("should return 401 if HOD emp_no is not on req.user", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = mockValidPayload;
        req.user = null; // No user on request
        yield (0, assigmentController_controller_1.assignmentController)(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Not a valid Users" });
    }));
    it("should assign project successfully when DRM and ARM are new users (fetched from LDAP)", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = mockValidPayload;
        req.user = { id: hodEmpNo };
        // Mock HOD found
        mockTx.hod.findUnique.mockResolvedValue(mockHodRecord);
        // Mock DRM and ARM not existing in appUser
        mockTx.appUser.findUnique.mockResolvedValue(null); // Both DRM and ARM are new
        // Mock LDAP responses
        ldapAuth_1.findUserByIdentifier
            .mockResolvedValueOnce(mockLdapDataDrm) // First call for DRM
            .mockResolvedValueOnce(mockLdapDataArm); // Second call for ARM
        // Mock appUser create (optional, just to ensure it's called)
        mockTx.appUser.create.mockResolvedValue({}); // Resolves to some object
        mockTx.drm.create.mockResolvedValue({});
        mockTx.arm.create.mockResolvedValue({});
        const mockAssignment = {
            project_id: BigInt(123),
            project_name: mockValidPayload.project_name,
            project_remarks: mockValidPayload.project_remarks,
            hod_emp_no: BigInt(hodEmpNo),
            drm_emp_no: BigInt(drmEmpNoStr),
            arm_emp_no: BigInt(armEmpNoStr),
        };
        mockTx.projectAssignment.create.mockResolvedValue(mockAssignment);
        yield (0, assigmentController_controller_1.assignmentController)(req, res);
        expect(mockTx.hod.findUnique).toHaveBeenCalledWith({
            where: { emp_no: BigInt(hodEmpNo) },
        });
        expect(ldapAuth_1.findUserByIdentifier).toHaveBeenCalledWith(drmEmpNoNum);
        expect(ldapAuth_1.findUserByIdentifier).toHaveBeenCalledWith(armEmpNoNum);
        expect(mockTx.appUser.create).toHaveBeenCalledTimes(2); // For DRM and ARM
        expect(mockTx.drm.create).toHaveBeenCalledTimes(1);
        expect(mockTx.arm.create).toHaveBeenCalledTimes(1);
        expect(mockTx.projectAssignment.create).toHaveBeenCalledWith({
            data: {
                project_name: mockValidPayload.project_name,
                project_remarks: mockValidPayload.project_remarks,
                hod_emp_no: BigInt(hodEmpNo),
                drm_emp_no: BigInt(drmEmpNoStr),
                arm_emp_no: BigInt(armEmpNoStr),
            },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Project assigned successfully",
            result: stringifyBigInts(mockAssignment),
        });
    }));
    it("should assign project successfully when DRM and ARM are existing active users", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = mockValidPayload;
        req.user = { id: hodEmpNo };
        // Mock HOD found
        mockTx.hod.findUnique.mockResolvedValue(mockHodRecord);
        // Mock DRM and ARM existing in appUser
        mockTx.appUser.findUnique
            .mockResolvedValueOnce({ emp_no: drmEmpNoNum, role: client_1.Role.DRM }) // DRM exists
            .mockResolvedValueOnce({ emp_no: armEmpNoNum, role: client_1.Role.ARM }); // ARM exists
        // Mock DRM and ARM are active in their respective tables
        mockTx.drm.findUnique.mockResolvedValue({
            emp_no: drmEmpNoNum,
            is_active: true,
        });
        mockTx.arm.findUnique.mockResolvedValue({
            emp_no: armEmpNoNum,
            is_active: true,
        });
        const mockAssignment = {
        /* ... same as above ... */
        };
        mockTx.projectAssignment.create.mockResolvedValue(mockAssignment);
        yield (0, assigmentController_controller_1.assignmentController)(req, res);
        expect(ldapAuth_1.findUserByIdentifier).not.toHaveBeenCalled(); // LDAP should not be called
        expect(mockTx.appUser.create).not.toHaveBeenCalled(); // No new appUsers
        expect(mockTx.drm.create).not.toHaveBeenCalled();
        expect(mockTx.arm.create).not.toHaveBeenCalled();
        expect(mockTx.projectAssignment.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        // expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Project assigned successfully" }));
    }));
    it("should return 500 if HOD is not found in DB", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = mockValidPayload;
        req.user = { id: hodEmpNo };
        mockTx.hod.findUnique.mockResolvedValue(null); // HOD not found
        yield (0, assigmentController_controller_1.assignmentController)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "HOD not found in database",
        });
    }));
    it("should return 500 if an existing DRM user is not active", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = mockValidPayload;
        req.user = { id: hodEmpNo };
        mockTx.appUser.findUnique
            .mockResolvedValueOnce({ emp_no: drmEmpNoNum, role: client_1.Role.DRM }) // DRM exists
            .mockResolvedValueOnce({ emp_no: armEmpNoNum, role: client_1.Role.ARM }); // ARM exists (or new, doesn't matter for this test focus)
        mockTx.drm.findUnique.mockResolvedValue({
            emp_no: drmEmpNoNum,
            is_active: false,
        }); // DRM is inactive
        // Assume ARM is fine for this test
        ldapAuth_1.findUserByIdentifier.mockResolvedValueOnce(mockLdapDataArm); // If ARM was new
        mockTx.arm.findUnique.mockResolvedValue({
            emp_no: armEmpNoNum,
            is_active: true,
        }); // Or if ARM existing & active
        yield (0, assigmentController_controller_1.assignmentController)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: `DRM with emp_no ${drmEmpNoNum} is not active.`,
        });
    }));
    it("should return 500 if LDAP lookup fails for a new user", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = mockValidPayload;
        req.user = { id: hodEmpNo };
        mockTx.appUser.findUnique.mockResolvedValue(null); // DRM is new
        ldapAuth_1.findUserByIdentifier.mockResolvedValue(null); // LDAP returns null for DRM
        yield (0, assigmentController_controller_1.assignmentController)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        // expect(res.json).toHaveBeenCalledWith({
        //   message: `${hodEmpNo} not found in LDAP.`,
        // }); // Role.DRM is 'DRM'
    }));
    it("should return 500 if projectAssignment.create fails", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = mockValidPayload;
        req.user = { id: hodEmpNo };
        // Assume users are fine
        mockTx.appUser.findUnique.mockResolvedValue(null);
        ldapAuth_1.findUserByIdentifier
            .mockResolvedValueOnce(mockLdapDataDrm)
            .mockResolvedValueOnce(mockLdapDataArm);
        mockTx.drm.create.mockResolvedValue({});
        mockTx.arm.create.mockResolvedValue({});
        const dbError = new Error("Project assignment creation failed");
        mockTx.projectAssignment.create.mockRejectedValue(dbError);
        yield (0, assigmentController_controller_1.assignmentController)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: dbError.message });
    }));
});
