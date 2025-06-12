"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaptRenewalReviewBodySchema = exports.VaptRenewalHodActionBodySchema = exports.VaptRenewalResponseSchema = exports.CreateVaptRenewalBodySchema = void 0;
const zod_1 = __importDefault(require("zod"));
// Schema to validate input for creating a vapt renewal
const CreateVaptRenewalBodySchema = zod_1.default.object({
    dm_id: zod_1.default.string().min(1).pipe(zod_1.default.bigint()),
    vapt_id: zod_1.default.string().min(1).pipe(zod_1.default.bigint()),
    new_vapt_report: zod_1.default
        .string()
        .min(1)
        .transform((s) => Buffer.from(s, "base64")),
    new_vapt_expiry_date: zod_1.default
        .string()
        .min(1)
        .transform((s) => new Date(s)),
    drm_remarks: zod_1.default.string().min(1),
});
exports.CreateVaptRenewalBodySchema = CreateVaptRenewalBodySchema;
// Enum schema for vapt response status
const VaptRenewalRequestStatusSchema = zod_1.default.enum([
    "PENDING_APPROVAL",
    "APPROVED_BY_HOD",
    "REJECTED_BY_HOD",
]);
// Schema to structure response
const VaptRenewalResponseSchema = zod_1.default.object({
    vapt_rnwl_id: zod_1.default.bigint().transform((b) => b.toString()),
    dm_id: zod_1.default.bigint().transform((b) => b.toString()),
    created_at: zod_1.default.coerce.date(),
    rnwl_no: zod_1.default.bigint().transform((b) => b.toString()),
    vapt_id: zod_1.default.bigint().transform((b) => b.toString()),
    old_vapt_report: zod_1.default
        .union([zod_1.default.instanceof(Buffer), zod_1.default.instanceof(Uint8Array)])
        .nullable()
        .optional()
        .transform((b) => b === null || b === void 0 ? void 0 : b.toString("base64")),
    new_vapt_report: zod_1.default
        .union([zod_1.default.instanceof(Buffer), zod_1.default.instanceof(Uint8Array)])
        .transform((b) => b === null || b === void 0 ? void 0 : b.toString("base64")),
    new_vapt_expiry_date: zod_1.default.coerce.date().nullable().optional(),
    drm_empno_initiator: zod_1.default
        .bigint()
        .transform((b) => b.toString())
        .nullable()
        .optional(),
    // ! DRM related fields that might be added later
    //   drm_name: z.string().optional(),
    //   drm_centre: z.string().optional(),
    //   drm_group: z.string().optional(),
    drm_remarks: zod_1.default.string(),
    is_aprvd: zod_1.default.boolean().nullable().optional(),
    hod_empno_approver: zod_1.default
        .bigint()
        .transform((b) => b.toString())
        .nullable()
        .optional(),
    // ! HOD related fields that might be added later
    //   hod_name: z.string().optional(),
    //   hod_centre: z.string().optional(),
    //   hod_group: z.string().optional(),
    aprvl_date: zod_1.default.coerce.date().nullable().optional(),
    hod_remarks: zod_1.default.string(),
    status: VaptRenewalRequestStatusSchema,
    updated_at: zod_1.default.coerce.date(),
});
exports.VaptRenewalResponseSchema = VaptRenewalResponseSchema;
// Schema to approve/reject response
const VaptRenewalHodActionBodySchema = zod_1.default.object({
    // vapt_rnwl_id: z.coerce.bigint(),
    is_aprvd: zod_1.default.boolean(),
    hod_remarks: zod_1.default.string().optional().default("NA"),
    dm_id: zod_1.default.string().transform((s) => BigInt(s)),
});
exports.VaptRenewalHodActionBodySchema = VaptRenewalHodActionBodySchema;
// Schema for vapt renewal review by DRM
const VaptRenewalReviewBodySchema = zod_1.default.object({
    // vapt_rnwl_id: z.coerce.bigint(),
    new_vapt_report: zod_1.default
        .string()
        .transform((s) => Buffer.from(s, "base64"))
        .optional(),
    new_vapt_expiry_date: zod_1.default.coerce.date().optional(),
    drm_remarks: zod_1.default.string().optional(),
    dm_id: zod_1.default.string().transform((s) => BigInt(s)),
});
exports.VaptRenewalReviewBodySchema = VaptRenewalReviewBodySchema;
