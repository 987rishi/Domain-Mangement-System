import { VaptRenewalRequestStatus } from "@prisma/client";
import prisma from "../database/prisma";
import { VaptRenewalReviewBodyDTO } from "../validators/vaptRenewalValidators";

const vaptRenewalRepository = {
  // Find a running renewal given vapt_id
  findExistingNonApproved: async (vapt_id: bigint) => {
    return await prisma.vaptRenewal.findFirst({
      where: {
        vapt_id,
        status: { not: VaptRenewalRequestStatus.APPROVED_BY_HOD },
      },
    });
  },

  // Return renewal count given vapt_id
  countByVaptId: async (vapt_id: bigint) => {
    return await prisma.vaptRenewal.count({ where: { vapt_id } });
  },

  // Find by vapt_rnwl_id
  findById: async (vapt_rnwl_id: bigint) => {
    return await prisma.vaptRenewal.findUnique({
      where: { vapt_rnwl_id },
    });
  },

  // Return all renewals for a user
  findAll: async (role: "DRM" | "HOD", empno: bigint) => {
    if (role === "DRM")
      return await prisma.vaptRenewal.findMany({
        where: { created_by_drm: empno },
      });

    if (role === "HOD")
      return await prisma.vaptRenewal.findMany({
        where: { aprvd_by_hod: empno },
      });
  },

  // Update renewal
  update: async (
    where: {
      vapt_rnwl_id: bigint;
      // aprvd_by_hod: bigint;
    },
    data: any
  ) => {
    data = { ...data, aprvl_date: new Date() };
    return await prisma.vaptRenewal.update({ where, data });
  },

  // Create vapt renewal
  create: async (data: {
    vapt_id: bigint;
    old_vapt_report: Buffer;
    new_vapt_report: Buffer;
    new_vapt_expiry_date: Date;
    created_by_drm: bigint;
    drm_remarks: string;
    rnwl_no: bigint;
    aprvd_by_hod: bigint;
  }) => {
    return await prisma.vaptRenewal.create({ data });
  },
};

export default vaptRenewalRepository;
