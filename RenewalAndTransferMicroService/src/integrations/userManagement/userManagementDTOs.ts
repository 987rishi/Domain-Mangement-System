import { z } from "zod";

// Schema for drm information
export const DrmDetailsSchema = z.object({
  emp_no: z.coerce.bigint(),
  desig: z.string().nullable(),
  drm_fname: z.string().min(1),
  drm_lname: z.string().min(1),
  email_id: z.string().email(),
  tele_no: z.string().nullable(),
  mob_no: z.string().nullable(),
  centre_id: z.number().int(),
  grp_id: z.number().int(),
  is_active: z.boolean(),
});

// Infer the TypeScript type from the schema
export type DrmDetailsDto = z.infer<typeof DrmDetailsSchema>;

export const HodDetailsSchema = z.object({
  emp_no: z.coerce.bigint(),
  desig: z.string().nullable().optional(),
  hod_fname: z.string().min(1),
  hod_lname: z.string().min(1),
  email_id: z.string().email(),
  tele_no: z.string().nullable(),
  mob_no: z.string().nullable(),
  centre_id: z.number().int(),
  grp_id: z.number().int(),
  is_active: z.boolean(),
});

export type HodDetailsDto = z.infer<typeof HodDetailsSchema>;

export const NetopsDetailsSchema = z.object({
  emp_no: z.coerce.bigint(),
  desig: z.string().nullable().optional(),
  netops_fname: z.string().min(1),
  netops_lname: z.string().min(1),
  email_id: z.string().email(),
  tele_no: z.string().nullable(),
  mob_no: z.string().nullable(),
  centre_id: z.number().int(),
  grp_id: z.number().int(),
  is_active: z.boolean(),
});

export type NetopsDetailsDto = z.infer<typeof NetopsDetailsSchema>;

export const ArmDetailsSchema = z.object({
  emp_no: z.coerce.bigint(),
  desig: z.string().nullable().optional(),
  arm_fname: z.string().min(1),
  arm_lname: z.string().min(1),
  email_id: z.string().email(),
  tele_no: z.string().nullable(),
  mob_no: z.string().nullable(),
  centre_id: z.number().int(),
  grp_id: z.number().int(),
  is_active: z.boolean(),
});

export type ArmDetailsDto = z.infer<typeof ArmDetailsSchema>;

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
