"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveTransferBodySchema = exports.ApproveTransferParamsSchema = exports.CreateTransferResponseSchema = exports.CreateTransferBodySchema = void 0;
const zod_1 = require("zod");
const CreateTransferBodySchema = zod_1.z.object({
    dm_id: zod_1.z.string().min(1, "Missing Domain Id").pipe(zod_1.z.coerce.bigint()),
    trns_frm: zod_1.z.string().min(1).pipe(zod_1.z.coerce.bigint()),
    trns_to: zod_1.z.string().min(1).pipe(zod_1.z.coerce.bigint()),
    rsn_for_trns: zod_1.z.string().min(1),
    prf_upload: zod_1.z
        .string()
        .min(1)
        .transform((s) => Buffer.from(s, "base64")),
});
exports.CreateTransferBodySchema = CreateTransferBodySchema;
const CreateTransferResponseSchema = zod_1.z.object({
    tt_id: zod_1.z.bigint().transform((i) => i.toString()), // Unique identifier
    dm_id: zod_1.z.bigint().transform((i) => i.toString()), // Foreign key to DomainNameList
    trns_frm: zod_1.z.bigint().transform((i) => i.toString()), // Foreign key to DrmList (initiator)
    trns_to: zod_1.z.bigint().transform((i) => i.toString()), // Foreign key to DrmList (receiver)
    rsn_for_trns: zod_1.z.string(), // Reason for transfer
    prf_upload: zod_1.z
        .union([zod_1.z.instanceof(Buffer), zod_1.z.instanceof(Uint8Array)])
        .transform((b) => Buffer.from(b).toString("base64")),
    hod_empno: zod_1.z.coerce.string(),
    hod_approved: zod_1.z.boolean(), // HOD approval status
    hod_remarks: zod_1.z.coerce.string().default("NA"),
    created_at: zod_1.z.coerce.date(), // Converts strings or dates to Date
    approved_at: zod_1.z.coerce.date().nullable(), // Nullable Date
    updated_at: zod_1.z.coerce.date(),
});
exports.CreateTransferResponseSchema = CreateTransferResponseSchema;
const ApproveTransferParamsSchema = zod_1.z.object({
    tt_id: zod_1.z
        .string({ message: "Missing transferId" })
        .transform((s) => BigInt(s)),
});
exports.ApproveTransferParamsSchema = ApproveTransferParamsSchema;
const ApproveTransferBodySchema = zod_1.z.object({
    // hod_approved: z.boolean({ message: "Missing hod_approved (e.g. true)" }),
    transferId: zod_1.z.string().min(1).pipe(zod_1.z.coerce.bigint()),
    remarks: zod_1.z.string(),
});
exports.ApproveTransferBodySchema = ApproveTransferBodySchema;
