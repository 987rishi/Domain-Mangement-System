import { z } from "zod";

export const DomainNameSchema = z
  .object({
    domainNameId: z.number().transform((n) => BigInt(n)),
    domainName: z.string().min(1),
    drmEmployeeNumber: z.number().transform((n) => BigInt(n)),
    armEmployeeNumber: z
      .number()
      .transform((n) => BigInt(n))
      .nullable(),
    hodEmployeeNumber: z
      .number()
      .transform((n) => BigInt(n))
      .nullable(),
    edEmployeeNumber: z
      .number()
      .transform((n) => BigInt(n))
      .nullable(), // or non-nullable if always present
    netopsEmployeeNumber: z
      .number()
      .transform((n) => BigInt(n))
      .nullable(),
    webmasterEmployeeNumber: z
      .number()
      .transform((n) => BigInt(n))
      .nullable(),
    hodHpcEmployeeNumber: z
      .number()
      .transform((n) => BigInt(n))
      .nullable(),
    vaptCompliantStatus: z.boolean(),
    active: z.boolean(),
    renewal: z.boolean(),
    deleted: z.boolean(),
    approvalProofVaptCompliantStatus: z.any().nullable(), // or a more specific type
  })
  .passthrough();
export type DomainNameDto = z.infer<typeof DomainNameSchema>;

export const UpdateVaptSchema = z.object({
  vapt_id: z.bigint(),
  new_expiry_date: z.date(),
  new_vapt_report: z.string(),
});
export type UpdateVaptDto = z.infer<typeof UpdateVaptSchema>;
