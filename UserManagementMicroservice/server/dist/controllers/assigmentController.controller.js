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
exports.assignmentController = void 0;
const ldapAuth_1 = require("../services/ldapAuth");
const database_config_1 = __importDefault(require("../config/database.config"));
const client_1 = require("@prisma/client");
const assignmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { project_name, project_remarks, drm_emp_no, arm_emp_no } = req.body;
    const hod_emp_no = 3001; // later use req.user?.emp_no
    if (!project_name || !drm_emp_no || !arm_emp_no || !hod_emp_no) {
        res.status(400).json({ error: "Missing required fields." });
        return;
    }
    try {
        const result = yield database_config_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const hod = yield tx.hod.findUnique({
                where: { emp_no: hod_emp_no },
            });
            if (!hod)
                throw new Error("HOD not found in database");
            const { centre_id, grp_id } = hod;
            const validateUserAndStatus = (emp_no, role, table) => __awaiter(void 0, void 0, void 0, function* () {
                const existingUser = yield tx.appUser.findUnique({ where: { emp_no } });
                if (existingUser) {
                    // Check if the person is active in respective table
                    const roleRecord = yield (table === "drm"
                        ? tx.drm.findUnique({ where: { emp_no } })
                        : tx.arm.findUnique({ where: { emp_no } }));
                    if (!(roleRecord === null || roleRecord === void 0 ? void 0 : roleRecord.is_active)) {
                        throw new Error(`${table.toUpperCase()} with emp_no ${emp_no} is not active.`);
                    }
                    // Optional: check for conflicts with LDAP here if needed
                    return;
                }
                // If not found, fetch from LDAP and create as usual
                const ldapData = yield (0, ldapAuth_1.findUserByIdentifier)(emp_no);
                if (!ldapData)
                    throw new Error(`${role} not found in LDAP.`);
                const [firstName, ...rest] = ldapData.fullName.split(" ");
                const lastName = rest.join(" ") || "";
                yield tx.appUser.create({
                    data: {
                        emp_no,
                        usr_email: ldapData.employeeEmail,
                        usr_fname: firstName,
                        usr_lname: lastName,
                        role,
                        centre_id,
                    },
                });
                if (table === "drm") {
                    yield tx.drm.create({
                        data: {
                            emp_no,
                            email_id: ldapData.employeeEmail,
                            drm_fname: firstName,
                            drm_lname: lastName,
                            desig: null,
                            tele_no: null,
                            mob_no: null,
                            centre_id,
                            grp_id,
                        },
                    });
                }
                else {
                    yield tx.arm.create({
                        data: {
                            emp_no,
                            email_id: ldapData.employeeEmail,
                            arm_fname: firstName,
                            arm_lname: lastName,
                            desig: null,
                            tele_no: null,
                            mob_no: null,
                            centre_id,
                            grp_id,
                        },
                    });
                }
            });
            // Insert DRM and ARM users if not already present
            yield validateUserAndStatus(drm_emp_no, client_1.Role.DRM, "drm");
            yield validateUserAndStatus(arm_emp_no, client_1.Role.ARM, "arm");
            // Create Project Assignment only after users and roles exist
            const assignment = yield tx.projectAssignment.create({
                data: {
                    project_name,
                    project_remarks,
                    hod_emp_no,
                    drm_emp_no,
                    arm_emp_no,
                },
            });
            return assignment;
        }));
        const safeJson = (data) => JSON.parse(JSON.stringify(data, (_, v) => typeof v === "bigint" ? v.toString() : v));
        res.status(201).json({ message: "Project assigned successfully", result: safeJson(result), });
    }
    catch (error) {
        console.error("Assignment error:", error);
        res
            .status(500)
            .json({ message: error.message || "Error assigning project." });
    }
});
exports.assignmentController = assignmentController;
