import { transferRepository } from "../repositories/transferRepository";
import {
  ApproveTransferBodyDTO,
  ApproveTransferParamsDTO,
  CreateTransferBodyDTO,
} from "../validators/transferValidators";
import { AppError } from "../errors";
import { getUserDetails } from "../integrations/userManagement/userManagementService";
import { UserRoles } from "../integrations/userManagement/userManagementTypes";
import {
  getDomainDetails,
  updateDomainDetails,
} from "../integrations/workflow/workflowService";
import { sendNotification } from "../integrations/notifications/notificationService";
import { WebhookEventType } from "../integrations/notifications/notificationDTOs";

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Service that facilitates domain transfer between DRMs
export const transferService = {
  create: async (drm_empno: bigint, data: CreateTransferBodyDTO) => {
    console.log("SERVICE START".red);
    if (data.trns_frm === data.trns_to) {
      const e = new AppError(
        `Invalid request fields(trns_frm and trns_to are the same)`
      );
      e.statusCode = 400;
      throw e;
    }

    // Check for an unprocessed transfer in database | might throw
    const transfers = await transferRepository.getByDomainId(data.dm_id);
    const transferAlreadyExists = transfers.find((t) => !t.hod_approved);
    if (transferAlreadyExists) {
      const e = new AppError(
        `Cannot create transfer, a transfer request (ID: ${transferAlreadyExists.tt_id}) for this domain is already in process.`
      );
      e.statusCode = 409;
      throw e;
    }

    // --- MICROSERVICE INTERACTION START ---
    // TODO [Domain, transferInitiator, transferReceiver, transferInitiator's HOD, Notification to HOD]
    // Check if the domain exists
    const domain = await getDomainDetails(data.dm_id);
    if (!domain) {
      const e = new AppError(`Domain with id(${data.dm_id}) not found`);
      e.statusCode = 400;
      throw e;
    }
    console.log(domain);
    console.log("DOMAIN VERIFIED".red);

    // Check if the transferInitiator and transferReceiver Exist | both might throw
    const trns_frm = await getUserDetails(UserRoles.DRM, data.trns_frm);
    const trns_to = await getUserDetails(UserRoles.DRM, data.trns_to);
    console.log("trns_frm: ", trns_frm);
    console.log("trns_to: ", trns_to);
    if (!trns_frm || !trns_to) {
      const e = new AppError(
        `User with id(${!trns_frm ? "trns_frm" : "trns_to"}: ${
          !trns_frm ? data.trns_frm : data.trns_to
        }) does not exist`
      );
      e.statusCode = 400;
      throw e;
    }

    // Check if requestee(trns_frm) is authorized
    if (BigInt(trns_frm.emp_no) !== BigInt(domain.drmEmployeeNumber)) {
      console.error(
        `DRM(${data.trns_frm}) is not authorized to initiate a transfer for domain(${data.dm_id})
           DRM(${data.trns_frm}) is not responsible for domain(${data.dm_id})`
      );
      const e = new AppError(
        `DRM(${data.trns_frm}) is not authorized to initiate a transfer for (${data.dm_id})`
      );
      e.statusCode = 401;
      throw e;
    }

    //!Set HOD
    const compData = {
      hod_empno: domain.hodEmployeeNumber,
      dm_id: data.dm_id!,
      trns_frm: data.trns_frm!,
      trns_to: data.trns_to!,
      rsn_for_trns: data.rsn_for_trns!,
      prf_upload: data.prf_upload!,
    };

    let newTransfer: any;
    try {
      newTransfer = await transferRepository.create(compData);
    } catch (error) {
      console.error("Failed to create transfer in repository:", error);
      const e = new AppError("Failed to create the transfer record");
      e.statusCode = 500;
      throw e;
    }

    //!Notification
    // try {
    //   sendNotification(
    //     WebhookEventType.DOMAIN_TRANSFER_STARTED,
    //     {
    //       emp_no: drm_empno,
    //       role: "DRM",
    //     },
    //     {
    //       domainId: newTransfer.dm_id,
    //       domainName: "NA",
    //       remarks: newTransfer.rsn_for_trns,
    //     },
    //     {
    //       drm_emp_no: newTransfer.trns_frm,
    //       arm_emp_no: BigInt(domain.armEmployeeNumber),
    //     }
    //   );
    // } catch (error) {
    //   throw error;
    // }

    // --- MICROSERVICE INTERACTION END ---
    return newTransfer;
  },

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  approve: async (
    trnsfrId: bigint,
    approvingHodId: bigint,
    _data: ApproveTransferBodyDTO
  ) => {
    // 1. Check if the transfer exists
    const transfer = await transferRepository.getById(trnsfrId);
    if (!transfer) {
      const e = new AppError(`Transfer with ID ${trnsfrId} not found.`);
      e.statusCode = 404;
      throw e;
    }

    // 1.5 Check if the one who made this request is authorized
    if (transfer.hod_empno !== BigInt(approvingHodId)) {
      console.error(
        `
        Employee(${approvingHodId}) is not authorized to approve this transfer
        transfer.hod_empno = ${typeof transfer.hod_empno}
        approvingHodId = ${typeof approvingHodId}
        approvingHodId !== transfer.hod_empno => ${
          transfer.hod_empno !== approvingHodId
        }
        `
      );
      const e = new AppError(
        `You are not authorized to approve the transfer(${transfer.tt_id}) for domain(${transfer.dm_id})`
      );
      e.statusCode = 401;
      throw e;
    }

    // 2. Check if it's already approved
    if (transfer.hod_approved) {
      const e = new AppError(
        `Transfer with ID ${trnsfrId} has already been approved.`
      );
      e.statusCode = 409; // Conflict
      throw e;
    }

    // --- MICROSERVICE INTERACTION START ---
    // TODO: Verify the approvingHodId corresponds to a valid HOD user (Not neccessary - checked when creating the renewal)
    const approvingHOD = await getUserDetails(UserRoles.HOD, approvingHodId);
    if (!approvingHOD) {
      console.error(
        `[transferService.approve] Fatal Error: data is inconsistent(user-management-microservice has no listed employee with id ${approvingHodId})`
      );
      const e = new AppError(
        `Employee with the id(${approvingHodId}) not found`
      );
      e.statusCode = 404;
      throw e;
    }

    // 4. Approve
    let updatedTransfer;
    try {
      updatedTransfer = await transferRepository.approve(
        { tt_id: trnsfrId },
        { hod_remarks: _data.remarks, hod_approved: true } // Repository handles setting approved_at
      );
      const confirmUpdate = await updateDomainDetails(
        transfer.dm_id,
        transfer.trns_to
      );

      if (!confirmUpdate) {
        //! Rollback the database operation || timeout
        const e = new AppError(
          `Failed to synchronize the transfer with workflow service`
        );
        e.statusCode = 500;
        throw e;
      }
    } catch (error) {
      console.error(`Failed to approve transfer ID ${trnsfrId}:`, error);
      const e = new AppError("Failed to update transfer status.");
      e.statusCode = 500;
      throw e;
    }

    // TODO: Send Notification
    // try {
    //   sendNotification(
    //     WebhookEventType.DOMAIN_TRANSFER_STARTED,
    //     {
    //       emp_no: BigInt(updatedTransfer.hod_empno),
    //       role: "HOD",
    //     },
    //     {
    //       domainId: BigInt(updatedTransfer.dm_id),
    //       domainName: "NA",
    //       remarks: updatedTransfer.rsn_for_trns,
    //     },
    //     {
    //       drm_emp_no: BigInt(updatedTransfer.trns_frm),
    //     }
    //   );
    // } catch (error) {
    //   throw error;
    // }

    // --- MICROSERVICE INTERACTION END ---
    return updatedTransfer;
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

  getAll: async (requestingUserId: bigint, role?: "DRM" | "HOD") => {
    // 1. Get all transfers for the user
    const allTransfers = await transferRepository.getAll(
      requestingUserId,
      role
    );

    if (!allTransfers) {
      const e = (new AppError("Failed to fetch transfers").statusCode = 500);
      throw e;
    }
    // 2. Return the transfers
    return allTransfers;
  },
};
