"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentSchemaValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const numericStringAsBigInt = zod_1.default
    .string({
    required_error: "Employee number is required.",
    invalid_type_error: "Employee number must be a string.",
})
    .regex(/^\d+$/, { message: "Employee number must contain only digits." });
const assignmentSchemaValidation = zod_1.default.object({
    project_name: zod_1.default.string({
        required_error: 'Project name is required',
        invalid_type_error: "Project name must be a string",
    })
        .trim() // Remove leading/trailing whitespace
        .min(3, { message: 'Project name must be at least 3 characters long' })
        .max(100, { message: 'Project name cannot exceed 100 characters' }),
    project_remarks: zod_1.default.string({
        invalid_type_error: "Project remarks must be a string",
    })
        .max(500, { message: "Project remarks cannot exceed 500 characters" }), // Remarks are optional
    drm_emp_no: numericStringAsBigInt, // Use the helper for DRM emp no
    arm_emp_no: numericStringAsBigInt, // Use the helper for ARM emp no
}).refine(data => data.drm_emp_no !== data.arm_emp_no, {
    message: "DRM and ARM employee numbers cannot be the same.",
    path: ["arm_emp_no"], // Attach refinement error specifically to arm_emp_no field
});
exports.assignmentSchemaValidation = assignmentSchemaValidation;
