import { transferRepository } from "../repositories/transferRepository";
import {
  ApproveTransferBodyDTO,
  ApproveTransferParamsDTO,
  CreateTransferBodyDTO,
  CreateTransferResponseSchema,
} from "../validators/transferValidators";
import { AppError } from "../errors";

export const transferService = {
  create: async (data: CreateTransferBodyDTO) => {
    const transfers = await transferRepository.getByDomainId(data.dm_id);
    const transferAlreadyExists = transfers.find((t) => !t.hod_approved);
    if (transferAlreadyExists) {
      const e = new AppError(
        `Cannot create transfer, a transfer request (ID: ${transferAlreadyExists.tt_id}) for this domain is already in process.`
      );
      e.statusCode = 409;
      throw e;
    }

    // --- Placeholder Checks (Microservice Interaction) ---
    // TODO: Check if dm_id exists and is active (call domainService?)
    // TODO: Check if trns_frm (initiating DRM) exists and is valid
    // TODO: Check if trns_to (receiving DRM) exists and is valid
    // TODO: Get HOD of trns_frm DRM (needed for notifications or future logic?)

    // TODO: Check if initiatorDrm and receiverDrm are different
    if (data.trns_frm === data.trns_to) {
      const e = new AppError("Cannot transfer a domain to the same DRM.");
      e.statusCode = 400;
      throw e;
    }

    try {
      const newTransfer = await transferRepository.create(data);
      return newTransfer;
    } catch (error) {
      console.error("Failed to create transfer in repository:", error);
      const e = new AppError("Failed to create the transfer record");
      e.statusCode = 500;
      throw e;
    }
  },

  approve: async (
    params: ApproveTransferParamsDTO,
    _data: ApproveTransferBodyDTO,
    approvingHodId: bigint
  ) => {
    const { tt_id } = params;

    // 1. Check if the transfer exists
    const transfer = await transferRepository.getById(tt_id);
    if (!transfer) {
      const e = new AppError(`Transfer with ID ${tt_id} not found.`);
      e.statusCode = 404;
      throw e;
    }

    // 2. Check if it's already approved
    if (transfer.hod_approved) {
      const e = new AppError(
        `Transfer with ID ${tt_id} has already been approved.`
      );
      e.statusCode = 409; // Conflict
      throw e;
    }

    // --- Placeholder Checks (Microservice Interaction) ---
    // TODO: Verify the approvingHodId corresponds to a valid HOD user
    // TODO: Verify this HOD is authorized to approve *this* transfer
    // --- End Placeholder Checks ---

    // 4. Approve
    try {
      const updatedTransfer = await transferRepository.approve(
        { tt_id },
        { hod_approved: true } // Repository handles setting approved_at
      );
      return updatedTransfer;
    } catch (error) {
      console.error(`Failed to approve transfer ID ${tt_id}:`, error);
      const e = new AppError("Failed to update transfer status.");
      e.statusCode = 500;
      throw e;
    }
  },

  getById: async (tt_id: bigint, requestingUserId: bigint) => {
    // 1. Check if the transfer exists
    const transfer = await transferRepository.getById(tt_id);
    if (!transfer) {
      const e = new AppError(`Transfer with ID ${tt_id} not found.`);
      e.statusCode = 404;
      throw e;
    }

    // 2. Check if the requesting user is authorized (i.e. DRM, ARM, HOD)
    // TODO Add a check for HOD
    if (transfer.trns_frm == requestingUserId) {
      const e = new AppError(
        "You are not authorized to view this transfer record."
      );
      e.statusCode = 403; // Forbidden
      throw e;
    }

    return transfer;
  },

  getAll: async (requestingUserId: bigint) => {
    // 1. Get all transfers for the user
    const allTransfers = await transferRepository.getAll(requestingUserId);

    if (!allTransfers) {
      const e = (new AppError("Failed to fetch transfers").statusCode = 500);
      throw e;
    }
    // 2. Return the transfers
    return allTransfers;
  },
};
