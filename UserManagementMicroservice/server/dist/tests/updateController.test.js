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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// For Jest's SpiedFunction type, direct import or rely on globals if tsconfig is set
// import { SpiedFunction } from 'jest-mock';
const updateController_controller_1 = require("../controllers/updateController.controller"); // Adjust path
const database_config_1 = __importDefault(require("../config/database.config")); // Will be mocked
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
const mockRequest = (params = {}, body = {}) => ({
    params,
    body,
});
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
// --- Type Cast for Prisma Mock (to use in tests with type safety) ---
const prismaMock = database_config_1.default;
// --- Test Suite ---
describe("Update Controller (Simplified)", () => {
    let req;
    let res;
    let consoleLogSpy; // Or SpyInstance
    let consoleErrorSpy; // Or SpyInstance
    beforeEach(() => {
        jest.clearAllMocks(); // Resets all mocks, including those on prismaMock
        req = mockRequest();
        res = mockResponse();
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
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
    it("should return 400 if required fields are missing", () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { empNo };
        req.body = { designation: "Test" }; // Missing fields
        yield (0, updateController_controller_1.updateController)(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing required fields.",
        });
    }));
    it("should return 404 if user is not found", () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { empNo };
        req.body = updatePayload;
        prismaMock.appUser.findUnique.mockResolvedValue(null);
        yield (0, updateController_controller_1.updateController)(req, res);
        expect(prismaMock.appUser.findUnique).toHaveBeenCalledWith({
            where: { emp_no: empNoBigInt },
        });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: `User not found for employee number ${empNo}.`,
        });
    }));
    it("should update DRM user details successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { empNo };
        req.body = updatePayload;
        const mockUser = { emp_no: empNoBigInt, role: "DRM" };
        prismaMock.appUser.findUnique.mockResolvedValue(mockUser);
        prismaMock.drm.update.mockResolvedValue({}); // Mock successful update
        yield (0, updateController_controller_1.updateController)(req, res);
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
    }));
    it("should update ARM user details successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { empNo };
        req.body = updatePayload;
        const mockUser = { emp_no: empNoBigInt, role: "ARM" };
        prismaMock.appUser.findUnique.mockResolvedValue(mockUser);
        prismaMock.arm.update.mockResolvedValue({}); // Mock successful update
        yield (0, updateController_controller_1.updateController)(req, res);
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
    }));
    it("should return 404 if user role is not DRM or ARM", () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { empNo };
        req.body = updatePayload;
        const mockUser = { emp_no: empNoBigInt, role: "HOD" }; // Different role
        prismaMock.appUser.findUnique.mockResolvedValue(mockUser);
        yield (0, updateController_controller_1.updateController)(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: `No DRM and ARM found for employee number ${empNo}.`,
        });
        expect(prismaMock.drm.update).not.toHaveBeenCalled();
        expect(prismaMock.arm.update).not.toHaveBeenCalled();
    }));
    it("should return 500 on BigInt conversion error", () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { empNo: "abc" }; // Invalid empNo
        req.body = updatePayload;
        // BigInt(empNo) in controller will throw before DB call
        yield (0, updateController_controller_1.updateController)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error.",
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(SyntaxError));
    }));
    it("should return 500 on database error during findUnique", () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { empNo };
        req.body = updatePayload;
        const dbError = new Error("DB findUnique failed");
        prismaMock.appUser.findUnique.mockRejectedValue(dbError);
        yield (0, updateController_controller_1.updateController)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error.",
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith(dbError);
    }));
    it("should return 500 on database error during DRM update", () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { empNo };
        req.body = updatePayload;
        const mockUser = { emp_no: empNoBigInt, role: "DRM" };
        prismaMock.appUser.findUnique.mockResolvedValue(mockUser);
        const dbError = new Error("DB DRM update failed");
        prismaMock.drm.update.mockRejectedValue(dbError);
        yield (0, updateController_controller_1.updateController)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error.",
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith(dbError);
    }));
});
