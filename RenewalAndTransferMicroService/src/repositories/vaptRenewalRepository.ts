import { VaptRenewalRequestStatus } from "@prisma/client";
import prisma from "../database/prisma";

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
        where: { drm_empno_initiator: empno },
      });

    if (role === "HOD")
      return await prisma.vaptRenewal.findMany({
        where: { hod_empno_approver: empno },
      });
  },

  // Update renewal
  update: async (
    where: {
      vapt_rnwl_id: bigint;
      // hod_empno_approver: bigint;
    },
    data: any
  ) => {
    data = { ...data, aprvl_date: new Date() };
    return await prisma.vaptRenewal.update({ where, data });
  },

  // Create vapt renewal
  create: async (data: {
    dm_id: bigint;
    vapt_id: bigint;
    old_vapt_report: Buffer;
    new_vapt_report: Buffer;
    new_vapt_expiry_date: Date;
    drm_empno_initiator: bigint;
    drm_remarks: string;
    rnwl_no: bigint;
    hod_empno_approver: bigint;
  }) => {
    return await prisma.vaptRenewal.create({ data });
  },
};

export default vaptRenewalRepository;
