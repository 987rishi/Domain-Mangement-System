import { z } from "zod";

const CreateTransferBodySchema = z.object({
  dm_id: z.string({ message: "Missing Domain Id" }).transform((i) => BigInt(i)),
  trns_frm: z.string().transform((i) => BigInt(i)),
  trns_to: z.string().transform((i) => BigInt(i)),
  rsn_for_trns: z.string(),
  prf_upload: z.string().transform((s) => Buffer.from(s, "base64")),
});

const CreateTransferResponseSchema = z.object({
  tt_id: z.bigint().transform((i) => i.toString()), // Unique identifier
  created_at: z.coerce.date(), // Converts strings or dates to Date
  updated_at: z.coerce.date(),
  dm_id: z.bigint().transform((i) => i.toString()), // Foreign key to DomainNameList
  trns_frm: z.bigint().transform((i) => i.toString()), // Foreign key to DrmList (initiator)
  trns_to: z.bigint().transform((i) => i.toString()), // Foreign key to DrmList (receiver)
  rsn_for_trns: z.string(), // Reason for transfer
  prf_upload: z
    .union([z.instanceof(Buffer), z.instanceof(Uint8Array)])
    .transform((b) => Buffer.from(b).toString("base64")),

  hod_approved: z.boolean(), // HOD approval status
  approved_at: z.coerce.date().nullable(), // Nullable Date
});

const ApproveTransferParamsSchema = z.object({
  tt_id: z
    .string({ message: "Missing transferId" })
    .transform((s) => BigInt(s)),
});

const ApproveTransferBodySchema = z.object({
  hod_approved: z.boolean({ message: "Missing hod_approved (e.g. true)" }),
});

type CreateTransferBodyDTO = z.infer<typeof CreateTransferBodySchema>;
type ApproveTransferBodyDTO = z.infer<typeof ApproveTransferBodySchema>;
type ApproveTransferParamsDTO = z.infer<typeof ApproveTransferParamsSchema>;

export {
  CreateTransferBodySchema,
  CreateTransferResponseSchema,
  ApproveTransferParamsSchema,
  ApproveTransferBodySchema,
};
export {
  CreateTransferBodyDTO,
  ApproveTransferBodyDTO,
  ApproveTransferParamsDTO,
};
