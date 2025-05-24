"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateIpRenewalSchema = void 0;
const zod_1 = require("zod");
exports.CreateIpRenewalSchema = zod_1.z.object({
    ip_id: zod_1.z.coerce.bigint({
        required_error: "IP Id is required.",
        invalid_type_error: "Ip Id must be convertible to bigint (e.g. a string of digits)."
    }),
    prev_ip_addrs: zod_1.z.string({
        required_error: "Previous IP Address is required.",
        invalid_type_error: "Previous IP Address must be a string."
    }).nonempty({ message: "Previous IP Address cannot be empty." }),
    aprvl_pdf: zod_1.z.string({
        required_error: 'Approval PDF is required.',
        invalid_type_error: 'Approval PDF must be a base64 string.',
    }).base64({ message: 'Approval PDF must be a valid base64 encoded string.' })
        .nonempty({ message: 'Approval PDF cannot be empty.' }),
    drm_remarks: zod_1.z.string({
        invalid_type_error: 'DRM remarks must be a string.',
    }).optional(),
});
