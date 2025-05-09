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
const userController_helper_1 = require("../utils/userController.helper");
const schemaValidation_1 = require("../middleware/schemaValidation");
const helper_1 = require("../utils/helper");
/**
     * This is the transaction that creates the project assignment. If any of the
     * operations inside the transaction throw an error, the entire transaction
     * will be rolled back.
     *
     * This is the helper function that checks if a user exists in the appUser
     * table and is active in the respective table (either the drm table or
     * the arm table). If the user doesn't exist in the appUser table, it
     * fetches the user from LDAP and creates a new record in the appUser table.
     * It then creates a new record in either the drm table or the arm table,
     * depending on the role that was passed in.
     *
     
*/
/**
 * This endpoint creates a new project assignment. It takes in the project name,
 * project remarks, DRM employee number, and ARM employee number. It then checks
 * if all of the required fields are present, and if not, returns a 400 error
 * response. If all of the required fields are present, it proceeds to create
 * the project assignment.
 *
 * The project assignment is created in a transaction, meaning that either all
 * of the operations in the transaction succeed, or none of them do. This is
 * important because we don't want to have a situation where the project
 * assignment is created, but the DRM and ARM users aren't. Or vice versa.
 *
 * Inside the transaction, we first try to find the HOD user by their employee
 * number. If the HOD user isn't found, we throw an error that will cause the
 * transaction to rollback. If the HOD user is found, we extract the centre ID
 * and group ID from their record.
 *
 * Next, we define a helper function called `validateUserAndStatus`. This
 * function takes in an employee number, a role (either "DRM" or "ARM"), and a
 * table name (either "drm" or "arm"). It then checks if the user with the
 * given employee number exists in the appUser table. If the user exists, it
 * checks if the user is active in the respective table (either the drm table
 * or the arm table). If the user is not active, it throws an error. If the
 * user is active, it returns without doing anything else.
 *
 * If the user doesn't exist in the appUser table, it fetches the user from
 * LDAP and creates a new record in the appUser table. It then creates a new
 * record in either the drm table or the arm table, depending on the role that
 * was passed in.
 *
 * After defining the `validateUserAndStatus` function, we call it twice: once
 * for the DRM user, and once for the ARM user. If either of these calls
 * throws an error, the transaction will rollback.
 *
 * Finally, we create the project assignment itself. We do this only after
 * checking that the DRM and ARM users exist and are active.
 */
const assignmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // const { project_name, project_remarks,drm_emp_no,arm_emp_no} = req.body;
    const assignDrmArmBody = req.body;
    const payload = schemaValidation_1.assignmentSchemaValidation.safeParse(assignDrmArmBody);
    if (!payload.success) {
        const errors = (0, helper_1.formatError)(payload.error);
        // console.log("Validation error:", errors);
        res.status(422).json({ message: "Validation error", errors });
        return;
    }
    const project_name = payload.data.project_name;
    const project_remarks = payload.data.project_remarks;
    const drm_emp_no = payload.data.drm_emp_no;
    const arm_emp_no = payload.data.arm_emp_no;
    const hod_emp_no = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    console.log("The hod emp no is: ", hod_emp_no);
    if (!hod_emp_no) {
        res.status(401).json({ message: "Not a valid Users" });
        return;
    }
    try {
        // Create a new transaction
        const result = yield database_config_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Find the HOD user by their employee number
            const hod = yield tx.hod.findUnique({
                where: { emp_no: BigInt(hod_emp_no) },
            });
            if (!hod)
                throw new Error("HOD not found in database");
            // Extract the centre ID and group ID from the HOD record
            const { centre_id, grp_id } = hod;
            // Define the validateUserAndStatus function
            const validateUserAndStatus = (emp_no, role, table) => __awaiter(void 0, void 0, void 0, function* () {
                // Check if the user already exists in the appUser table
                const existingUser = yield tx.appUser.findUnique({ where: { emp_no } });
                if (existingUser) {
                    // Check if the user is active in the respective table
                    const roleRecord = yield (table === "drm"
                        ? tx.drm.findUnique({ where: { emp_no } })
                        : tx.arm.findUnique({ where: { emp_no } }));
                    if (!(roleRecord === null || roleRecord === void 0 ? void 0 : roleRecord.is_active)) {
                        // If the user is not active, throw an error that will cause the transaction to rollback
                        throw new Error(`${table.toUpperCase()} with emp_no ${emp_no} is not active.`);
                    }
                    // Optional: check for conflicts with LDAP here if needed
                    return;
                }
                // If the user doesn't exist, fetch from LDAP and create as usual
                const ldapData = yield (0, ldapAuth_1.findUserByIdentifier)(emp_no);
                if (!ldapData)
                    throw new Error(`${role} not found in LDAP.`);
                // Split the full name into first name and last name
                const [firstName, ...rest] = ldapData.fullName.split(" ");
                const lastName = rest.join(" ") || "";
                // Create a new record in the appUser table
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
                // Create a new record in either the drm table or the arm table
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
            // Call the validateUserAndStatus function for the DRM user
            yield validateUserAndStatus(Number(drm_emp_no), client_1.Role.DRM, "drm");
            // Call the validateUserAndStatus function for the ARM user
            yield validateUserAndStatus(Number(arm_emp_no), client_1.Role.ARM, "arm");
            // Create the project assignment only after the users and roles exist
            const assignment = yield tx.projectAssignment.create({
                data: {
                    project_name,
                    project_remarks,
                    hod_emp_no: BigInt(hod_emp_no),
                    drm_emp_no: BigInt(drm_emp_no),
                    arm_emp_no: BigInt(arm_emp_no),
                },
            });
            return assignment;
        }));
        // Return the result of the transaction
        res.status(201).json({ message: "Project assigned successfully", result: (0, userController_helper_1.stringifyBigInts)(result) });
    }
    catch (error) {
        console.error("Assignment error:", error);
        res
            .status(500)
            .json({ message: error.message || "Error assigning project." });
    }
});
exports.assignmentController = assignmentController;
