import { z } from "zod";
import { getTransfersByRoleAndId } from "../controllers/transferController";

const CreateTransferBodySchema = z.object({
  dm_id: z.string().min(1, "Missing Domain Id").pipe(z.coerce.bigint()),
  trns_frm: z.string().min(1).pipe(z.coerce.bigint()),
  trns_to: z.string().min(1).pipe(z.coerce.bigint()),
  rsn_for_trns: z.string().min(1),
  prf_upload: z
    .string()
    .min(1)
    .transform((s) => Buffer.from(s, "base64")),
});

const CreateTransferResponseSchema = z.object({
  tt_id: z.bigint().transform((i) => i.toString()), // Unique identifier
  dm_id: z.bigint().transform((i) => i.toString()), // Foreign key to DomainNameList
  trns_frm: z.bigint().transform((i) => i.toString()), // Foreign key to DrmList (initiator)
  trns_to: z.bigint().transform((i) => i.toString()), // Foreign key to DrmList (receiver)
  rsn_for_trns: z.string(), // Reason for transfer
  prf_upload: z
    .union([z.instanceof(Buffer), z.instanceof(Uint8Array)])
    .transform((b) => Buffer.from(b).toString("base64")),

  hod_empno: z.coerce.string(),
  hod_approved: z.boolean(), // HOD approval status
  hod_remarks: z.coerce.string().default("NA"),
  created_at: z.coerce.date(), // Converts strings or dates to Date
  approved_at: z.coerce.date().nullable(), // Nullable Date
  updated_at: z.coerce.date(),
});

const ApproveTransferParamsSchema = z.object({
  tt_id: z
    .string({ message: "Missing transferId" })
    .transform((s) => BigInt(s)),
});

const ApproveTransferBodySchema = z.object({
  // hod_approved: z.boolean({ message: "Missing hod_approved (e.g. true)" }),
  transferId: z.string().min(1).pipe(z.coerce.bigint()),
  remarks: z.string(),
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
