"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVaptSchema = exports.DomainNameSchema = void 0;
const zod_1 = require("zod");
exports.DomainNameSchema = zod_1.z
    .object({
    domainNameId: zod_1.z.number().transform((n) => BigInt(n)),
    domainName: zod_1.z.string().min(1),
    drmEmployeeNumber: zod_1.z.number().transform((n) => BigInt(n)),
    armEmployeeNumber: zod_1.z
        .number()
        .transform((n) => BigInt(n))
        .nullable(),
    hodEmployeeNumber: zod_1.z
        .number()
        .transform((n) => BigInt(n))
        .nullable(),
    edEmployeeNumber: zod_1.z
        .number()
        .transform((n) => BigInt(n))
        .nullable(), // or non-nullable if always present
    netopsEmployeeNumber: zod_1.z
        .number()
        .transform((n) => BigInt(n))
        .nullable(),
    webmasterEmployeeNumber: zod_1.z
        .number()
        .transform((n) => BigInt(n))
        .nullable(),
    hodHpcEmployeeNumber: zod_1.z
        .number()
        .transform((n) => BigInt(n))
        .nullable(),
    vaptCompliantStatus: zod_1.z.boolean(),
    active: zod_1.z.boolean(),
    renewal: zod_1.z.boolean(),
    deleted: zod_1.z.boolean(),
    approvalProofVaptCompliantStatus: zod_1.z.any().nullable(), // or a more specific type
})
    .passthrough();
exports.UpdateVaptSchema = zod_1.z.object({
    vapt_id: zod_1.z.bigint(),
    new_expiry_date: zod_1.z.date(),
    new_vapt_report: zod_1.z.string(),
});
