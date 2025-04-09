import prisma from "../database/prisma";

export const transferRepository = {
  create: async (data: {
    dm_id: bigint;
    trns_frm: bigint;
    trns_to: bigint;
    rsn_for_trns: string;
    prf_upload: Buffer;
  }) => {
    return await prisma.transfer.create({ data });
  },

  getById: async (tt_id: bigint) => {
    return await prisma.transfer.findUnique({ where: { tt_id } });
  },

  getByDomainId: async (dm_id: bigint) => {
    return await prisma.transfer.findMany({ where: { dm_id } });
  },

  getAll: async (trns_frm?: bigint) => {
    return await prisma.transfer.findMany({ where: { trns_frm } });
  },

  approve: async (
    where: { tt_id: bigint },
    data: { hod_approved: boolean; approved_at?: Date }
  ) => {
    data.approved_at = data.approved_at ?? new Date();
    return await prisma.transfer.update({ where, data });
  },
};
