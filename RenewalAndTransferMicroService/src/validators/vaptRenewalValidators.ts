import z from "zod";

// Schema to validate input for creating a vapt renewal
const CreateVaptRenewalBodySchema = z.object({
  dm_id: z.string().min(1).pipe(z.bigint()),
  vapt_id: z.string().min(1).pipe(z.bigint()),
  new_vapt_report: z
    .string()
    .min(1)
    .transform((s) => Buffer.from(s, "base64")),
  new_vapt_expiry_date: z
    .string()
    .min(1)
    .transform((s) => new Date(s)),
  drm_remarks: z.string().min(1),
});

type CreateVaptRenewalBodyDTO = z.infer<typeof CreateVaptRenewalBodySchema>;

// Enum schema for vapt response status
const VaptRenewalRequestStatusSchema = z.enum([
  "PENDING_APPROVAL",
  "APPROVED_BY_HOD",
  "REJECTED_BY_HOD",
]);

// Schema to structure response
const VaptRenewalResponseSchema = z.object({
  vapt_rnwl_id: z.bigint().transform((b) => b.toString()),
  dm_id: z.bigint().transform((b) => b.toString()),
  created_at: z.coerce.date(),
  rnwl_no: z.bigint().transform((b) => b.toString()),
  vapt_id: z.bigint().transform((b) => b.toString()),

  old_vapt_report: z
    .union([z.instanceof(Buffer), z.instanceof(Uint8Array)])
    .nullable()
    .optional()
    .transform((b) => b?.toString("base64")),

  new_vapt_report: z
    .union([z.instanceof(Buffer), z.instanceof(Uint8Array)])
    .transform((b) => b?.toString("base64")),

  new_vapt_expiry_date: z.coerce.date().nullable().optional(),

  drm_empno_initiator: z
    .bigint()
    .transform((b) => b.toString())
    .nullable()
    .optional(),

  // ! DRM related fields that might be added later
  //   drm_name: z.string().optional(),
  //   drm_centre: z.string().optional(),
  //   drm_group: z.string().optional(),

  drm_remarks: z.string(),
  is_aprvd: z.boolean().nullable().optional(),

  hod_empno_approver: z
    .bigint()
    .transform((b) => b.toString())
    .nullable()
    .optional(),

  // ! HOD related fields that might be added later
  //   hod_name: z.string().optional(),
  //   hod_centre: z.string().optional(),
  //   hod_group: z.string().optional(),

  aprvl_date: z.coerce.date().nullable().optional(),
  hod_remarks: z.string(),
  status: VaptRenewalRequestStatusSchema,
  updated_at: z.coerce.date(),
});

type VaptRenewalResponse = z.infer<typeof VaptRenewalResponseSchema>;

// Schema to approve/reject response
const VaptRenewalHodActionBodySchema = z.object({
  // vapt_rnwl_id: z.coerce.bigint(),
  is_aprvd: z.boolean(),
  hod_remarks: z.string().optional().default("NA"),
  dm_id: z.string().transform((s) => BigInt(s)),
});

type VaptRenewalHodActionDTO = z.infer<typeof VaptRenewalHodActionBodySchema>;

// Schema for vapt renewal review by DRM
const VaptRenewalReviewBodySchema = z.object({
  // vapt_rnwl_id: z.coerce.bigint(),
  new_vapt_report: z
    .string()
    .transform((s) => Buffer.from(s, "base64"))
    .optional(),
  new_vapt_expiry_date: z.coerce.date().optional(),
  drm_remarks: z.string().optional(),
  dm_id: z.string().transform((s) => BigInt(s)),
});

type VaptRenewalReviewBodyDTO = z.infer<typeof VaptRenewalReviewBodySchema>;

export {
  CreateVaptRenewalBodySchema,
  VaptRenewalResponseSchema,
  VaptRenewalHodActionBodySchema,
  VaptRenewalReviewBodySchema,
};
export {
  CreateVaptRenewalBodyDTO,
  VaptRenewalResponse,
  VaptRenewalHodActionDTO,
  VaptRenewalReviewBodyDTO,
};
