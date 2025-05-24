"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferService = void 0;
const transferRepository_1 = require("../repositories/transferRepository");
const errors_1 = require("../errors");
const userManagementService_1 = require("../integrations/userManagement/userManagementService");
const userManagementTypes_1 = require("../integrations/userManagement/userManagementTypes");
const workflowService_1 = require("../integrations/workflow/workflowService");
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Service that facilitates domain transfer between DRMs
exports.transferService = {
    create: (drm_empno, data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("SERVICE START".red);
        if (data.trns_frm === data.trns_to) {
            const e = new errors_1.AppError(`Invalid request fields(trns_frm and trns_to are the same)`);
            e.statusCode = 400;
            throw e;
        }
        // Check for an unprocessed transfer in database | might throw
        const transfers = yield transferRepository_1.transferRepository.getByDomainId(data.dm_id);
        const transferAlreadyExists = transfers.find((t) => !t.hod_approved);
        if (transferAlreadyExists) {
            const e = new errors_1.AppError(`Cannot create transfer, a transfer request (ID: ${transferAlreadyExists.tt_id}) for this domain is already in process.`);
            e.statusCode = 409;
            throw e;
        }
        // --- MICROSERVICE INTERACTION START ---
        // TODO [Domain, transferInitiator, transferReceiver, transferInitiator's HOD, Notification to HOD]
        // Check if the domain exists
        const domain = yield (0, workflowService_1.getDomainDetails)(data.dm_id);
        if (!domain) {
            const e = new errors_1.AppError(`Domain with id(${data.dm_id}) not found`);
            e.statusCode = 400;
            throw e;
        }
        console.log(domain);
        console.log("DOMAIN VERIFIED".red);
        // Check if the transferInitiator and transferReceiver Exist | both might throw
        const trns_frm = yield (0, userManagementService_1.getUserDetails)(userManagementTypes_1.UserRoles.DRM, data.trns_frm);
        const trns_to = yield (0, userManagementService_1.getUserDetails)(userManagementTypes_1.UserRoles.DRM, data.trns_to);
        console.log("trns_frm: ", trns_frm);
        console.log("trns_to: ", trns_to);
        if (!trns_frm || !trns_to) {
            const e = new errors_1.AppError(`User with id(${!trns_frm ? "trns_frm" : "trns_to"}: ${!trns_frm ? data.trns_frm : data.trns_to}) does not exist`);
            e.statusCode = 400;
            throw e;
        }
        // Check if requestee(trns_frm) is authorized
        if (BigInt(trns_frm.emp_no) !== BigInt(domain.drmEmployeeNumber)) {
            console.error(`DRM(${data.trns_frm}) is not authorized to initiate a transfer for domain(${data.dm_id})
           DRM(${data.trns_frm}) is not responsible for domain(${data.dm_id})`);
            const e = new errors_1.AppError(`DRM(${data.trns_frm}) is not authorized to initiate a transfer for (${data.dm_id})`);
            e.statusCode = 401;
            throw e;
        }
        //!Set HOD
        const compData = {
            hod_empno: domain.hodEmployeeNumber,
            dm_id: data.dm_id,
            trns_frm: data.trns_frm,
            trns_to: data.trns_to,
            rsn_for_trns: data.rsn_for_trns,
            prf_upload: data.prf_upload,
        };
        let newTransfer;
        try {
            newTransfer = yield transferRepository_1.transferRepository.create(compData);
        }
        catch (error) {
            console.error("Failed to create transfer in repository:", error);
            const e = new errors_1.AppError("Failed to create the transfer record");
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
    }),
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    approve: (trnsfrId, approvingHodId, _data) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Check if the transfer exists
        const transfer = yield transferRepository_1.transferRepository.getById(trnsfrId);
        if (!transfer) {
            const e = new errors_1.AppError(`Transfer with ID ${trnsfrId} not found.`);
            e.statusCode = 404;
            throw e;
        }
        // 1.5 Check if the one who made this request is authorized
        if (transfer.hod_empno !== BigInt(approvingHodId)) {
            console.error(`
        Employee(${approvingHodId}) is not authorized to approve this transfer
        transfer.hod_empno = ${typeof transfer.hod_empno}
        approvingHodId = ${typeof approvingHodId}
        approvingHodId !== transfer.hod_empno => ${transfer.hod_empno !== approvingHodId}
        `);
            const e = new errors_1.AppError(`You are not authorized to approve the transfer(${transfer.tt_id}) for domain(${transfer.dm_id})`);
            e.statusCode = 401;
            throw e;
        }
        // 2. Check if it's already approved
        if (transfer.hod_approved) {
            const e = new errors_1.AppError(`Transfer with ID ${trnsfrId} has already been approved.`);
            e.statusCode = 409; // Conflict
            throw e;
        }
        // --- MICROSERVICE INTERACTION START ---
        // TODO: Verify the approvingHodId corresponds to a valid HOD user (Not neccessary - checked when creating the renewal)
        const approvingHOD = yield (0, userManagementService_1.getUserDetails)(userManagementTypes_1.UserRoles.HOD, approvingHodId);
        if (!approvingHOD) {
            console.error(`[transferService.approve] Fatal Error: data is inconsistent(user-management-microservice has no listed employee with id ${approvingHodId})`);
            const e = new errors_1.AppError(`Employee with the id(${approvingHodId}) not found`);
            e.statusCode = 404;
            throw e;
        }
        // 4. Approve
        let updatedTransfer;
        try {
            updatedTransfer = yield transferRepository_1.transferRepository.approve({ tt_id: trnsfrId }, { hod_remarks: _data.remarks, hod_approved: true } // Repository handles setting approved_at
            );
            const confirmUpdate = yield (0, workflowService_1.updateDomainDetails)(transfer.dm_id, transfer.trns_to);
            if (!confirmUpdate) {
                //! Rollback the database operation || timeout
                const e = new errors_1.AppError(`Failed to synchronize the transfer with workflow service`);
                e.statusCode = 500;
                throw e;
            }
        }
        catch (error) {
            console.error(`Failed to approve transfer ID ${trnsfrId}:`, error);
            const e = new errors_1.AppError("Failed to update transfer status.");
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
    }),
    getById: (tt_id, requestingUserId) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Check if the transfer exists
        const transfer = yield transferRepository_1.transferRepository.getById(tt_id);
        if (!transfer) {
            const e = new errors_1.AppError(`Transfer with ID ${tt_id} not found.`);
            e.statusCode = 404;
            throw e;
        }
        // 2. Check if the requesting user is authorized (i.e. DRM, ARM, HOD)
        // TODO Add a check for HOD
        if (transfer.trns_frm == requestingUserId) {
            const e = new errors_1.AppError("You are not authorized to view this transfer record.");
            e.statusCode = 403; // Forbidden
            throw e;
        }
        return transfer;
    }),
    getAll: (requestingUserId, role) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Get all transfers for the user
        const allTransfers = yield transferRepository_1.transferRepository.getAll(requestingUserId, role);
        if (!allTransfers) {
            const e = (new errors_1.AppError("Failed to fetch transfers").statusCode = 500);
            throw e;
        }
        // 2. Return the transfers
        return allTransfers;
    }),
};
