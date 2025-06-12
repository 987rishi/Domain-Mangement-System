"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmDetailsSchema = exports.NetopsDetailsSchema = exports.HodDetailsSchema = exports.DrmDetailsSchema = void 0;
const zod_1 = require("zod");
// Schema for drm information
exports.DrmDetailsSchema = zod_1.z.object({
    emp_no: zod_1.z.coerce.bigint(),
    desig: zod_1.z.string().nullable(),
    drm_fname: zod_1.z.string().min(1),
    drm_lname: zod_1.z.string().min(1),
    email_id: zod_1.z.string().email(),
    tele_no: zod_1.z.string().nullable(),
    mob_no: zod_1.z.string().nullable(),
    centre_id: zod_1.z.number().int(),
    grp_id: zod_1.z.number().int(),
    is_active: zod_1.z.boolean(),
});
exports.HodDetailsSchema = zod_1.z.object({
    emp_no: zod_1.z.coerce.bigint(),
    desig: zod_1.z.string().nullable().optional(),
    hod_fname: zod_1.z.string().min(1),
    hod_lname: zod_1.z.string().min(1),
    email_id: zod_1.z.string().email(),
    tele_no: zod_1.z.string().nullable(),
    mob_no: zod_1.z.string().nullable(),
    centre_id: zod_1.z.number().int(),
    grp_id: zod_1.z.number().int(),
    is_active: zod_1.z.boolean(),
});
exports.NetopsDetailsSchema = zod_1.z.object({
    emp_no: zod_1.z.coerce.bigint(),
    desig: zod_1.z.string().nullable().optional(),
    netops_fname: zod_1.z.string().min(1),
    netops_lname: zod_1.z.string().min(1),
    email_id: zod_1.z.string().email(),
    tele_no: zod_1.z.string().nullable(),
    mob_no: zod_1.z.string().nullable(),
    centre_id: zod_1.z.number().int(),
    grp_id: zod_1.z.number().int(),
    is_active: zod_1.z.boolean(),
});
exports.ArmDetailsSchema = zod_1.z.object({
    emp_no: zod_1.z.coerce.bigint(),
    desig: zod_1.z.string().nullable().optional(),
    arm_fname: zod_1.z.string().min(1),
    arm_lname: zod_1.z.string().min(1),
    email_id: zod_1.z.string().email(),
    tele_no: zod_1.z.string().nullable(),
    mob_no: zod_1.z.string().nullable(),
    centre_id: zod_1.z.number().int(),
    grp_id: zod_1.z.number().int(),
    is_active: zod_1.z.boolean(),
});
/*
This UserDetailsDto type is equivalent to:
type UserDetailsDto = {
  emp_no: string;
  desig: string | null;
  drm_fname: string;
  drm_lname: string;
  email_id: string;
  tele_no: string | null;
  mob_no: string | null;
  centre_id: number;
  grp_id: number;
  is_active: boolean;
};
*/
