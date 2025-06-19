import { bigint } from "zod";
import prisma from "../database/prisma";

type GetAllOptions = {
  empNo?: bigint;
  role?: "DRM" | "HOD";
  skip: number;
  take: number;
  orderBy: { [key: string]: "asc" | "desc" };
};

export const transferRepository = {
  create: async (data: {
    dm_id: bigint;
    trns_frm: bigint;
    trns_to: bigint;
    rsn_for_trns: string;
    prf_upload: Buffer;
    hod_empno: bigint;
  }) => {
    return await prisma.transfer.create({ data });
  },

  getById: async (tt_id: bigint) => {
    return await prisma.transfer.findUnique({ where: { tt_id } });
  },

  getByDomainId: async (dm_id: bigint) => {
    return await prisma.transfer.findMany({ where: { dm_id } });
  },

  getAll: async (options: GetAllOptions) => {
    const { empNo, role, skip, take, orderBy } = options;

    // Define the 'where' clause once to be used in both count and findMany
    const whereClause =
      role === "HOD" ? { hod_empno: empNo } : { trns_frm: empNo };

    // Use a transaction to get both the total count and the paginated data
    const [totalCount, transfers] = await prisma.$transaction([
      prisma.transfer.count({ where: whereClause }),
      prisma.transfer.findMany({
        where: whereClause,
        skip: skip,
        take: take,
        orderBy: orderBy,
      }),
    ]);

    return { totalCount, transfers };
  },

  approve: async (
    where: { tt_id: bigint },
    data: { hod_approved: true; hod_remarks: string; approved_at?: Date }
  ) => {
    data.approved_at = data.approved_at ?? new Date();
    return await prisma.transfer.update({ where, data });
  },
};
