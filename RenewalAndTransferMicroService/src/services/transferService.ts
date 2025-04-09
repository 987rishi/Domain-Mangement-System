import { transferRepository } from "../repositories/transferRepository";
import { CreateTransferBodyDTO } from "../validators/transferValidators";
import { AppError } from "../errors";

export const transferService = {
  create: async (data: CreateTransferBodyDTO) => {
    // Check if there are running transfers for domain
    const transfers = await transferRepository.getByDomainId(data.dm_id);
    const transferAlreadyExists = transfers.find(
      (t) => t.hod_approved === false
    );
    if (transferAlreadyExists) {
      const e = new AppError(
        "Cannot create transfer, transfer already in process"
      );
      e.statusCode = 403;
      throw e;
    }
    // Check if trns_frm, trnsr_to are valid DRM
    // Get HOD of trns_frm DRM
    // Create
    const newTransfer = await transferRepository.create(data);
    if (!newTransfer) {
      const e = new AppError("Failed to create a transfer");
      e.statusCode = 500;
      throw e;
    }
    return newTransfer;
  },

  approve: () => {
    // 1. Check if the renewal exists
    // 2. Check if it's already approved
    // 3. Check if the HOD exists
    // 4. approve
  },

  getById: () => {
    // 1. Check if the renewal exists
    // 2. Check if the user exists
    // 3. fetch
  },

  getAll: () => {
    // 1. Check if the user exists
    // 2.
  },
};
