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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const vaptRenewalRepository_1 = __importDefault(require("../repositories/vaptRenewalRepository"));
const workflowService_1 = require("../integrations/workflow/workflowService");
const userManagementService_1 = require("../integrations/userManagement/userManagementService");
// @assumes DRM is already validated (by api gateway)
const vaptRenewalService = {
    create: (drm_empno, data) => __awaiter(void 0, void 0, void 0, function* () {
        const exists = yield vaptRenewalRepository_1.default.findExistingNonApproved(data.vapt_id);
        if (exists) {
            console.error(`Found active vapt renewal for vapt id (${data.vapt_id})`);
            const e = new errors_1.AppError(`Found active renewal for vapt with id (${data.vapt_id})`);
            e.statusCode = 409;
            throw e;
        }
        // -- MICROSERVICE INTERACTOIN START [verify domain, verify/get vapt, get drmSupervisors, sendNotifications]--
        const domainRecord = yield (0, workflowService_1.getDomainDetails)(data.dm_id);
        if (!domainRecord) {
            console.error(`[vaptRenewalService.create] No domain found with domain id(${data.dm_id})`);
            const e = new errors_1.AppError(`Domain with id(${data.dm_id}) not found`);
            e.statusCode = 404;
            throw e;
        }
        console.log(`${domainRecord}`.red);
        const vaptRecord = yield (0, workflowService_1.getVaptDetailsById)(data.vapt_id);
        if (!vaptRecord) {
            console.error(`[vaptRenewalService.create] No VAPT found with vapt id(${data.vapt_id})`);
            const e = new errors_1.AppError(`No VAPT record found with id(${data.vapt_id})`);
            e.statusCode = 404;
            throw e;
        }
        console.log(`${vaptRecord}`.red);
        const drmSupervisors = yield (0, userManagementService_1.getUsersSupervisors)("DRM", drm_empno);
        if (!drmSupervisors) {
            console.error(`[vaptRnwlSrvc.create] srvc returned null for supervisors`);
            const e = new errors_1.AppError(`No Supervisors found for employee(${drm_empno})`);
            e.statusCode = 404;
            throw e;
        }
        console.log(`${drmSupervisors}`.red);
        const rnwl_no = BigInt((yield vaptRenewalRepository_1.default.countByVaptId(data.vapt_id)) + 1);
        const createRnwlObj = {
            dm_id: data.dm_id,
            vapt_id: data.vapt_id,
            new_vapt_report: data.new_vapt_report,
            new_vapt_expiry_date: data.new_vapt_expiry_date,
            drm_remarks: data.drm_remarks,
            drm_empno_initiator: drm_empno,
            hod_empno_approver: domainRecord.hodEmployeeNumber,
            rnwl_no: rnwl_no,
            old_vapt_report: vaptRecord.vapt_certificate,
        };
        // Create a vapt in the database. [request data, requestor, requestor's hod]
        const newRnwl = yield vaptRenewalRepository_1.default.create(createRnwlObj);
        if (!newRnwl) {
            console.error(`Failed to create renewal for vapt id ${data.vapt_id}`);
            const e = new errors_1.AppError("Failed to create vapt renewal");
            e.statusCode = 500;
            throw e;
        }
        // await sendNotification(
        //   WebhookEventType.VAPT_COMPLETED,
        //   { emp_no: drm_empno, role: "DRM" },
        //   { domainId: data.dm_id, domainName: domainRecord.domainName, remarks: data.drm_remarks },
        //   { drm_emp_no: drm_empno, hod_emp_no: domainRecord.hodEmployeeNumber }
        // );
        // -- MICROSERVICE INTERACTOIN END --
        return newRnwl;
    }),
    approve: (hod_empno, vapt_rnwl_id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const rnwlExists = yield vaptRenewalRepository_1.default.findById(vapt_rnwl_id);
        if (!rnwlExists) {
            console.error(`No renewal found for vapt renewal id (${vapt_rnwl_id})`);
            const e = new errors_1.AppError(`No renewal with id(${vapt_rnwl_id}) found`);
            e.statusCode = 404;
            throw e;
        }
        if (rnwlExists.hod_empno_approver !== hod_empno) {
            console.error(`HOD (${hod_empno}) is not authorized to approve renewal with id ${vapt_rnwl_id}`);
            const e = new errors_1.AppError(`You are not authorized to approve renewal with id ${vapt_rnwl_id}`);
            e.statusCode = 403;
            throw e;
        }
        if (rnwlExists.dm_id !== data.dm_id) {
            const e = new errors_1.AppError(`Domain(${data.dm_id}) is not related to VAPT(${rnwlExists.vapt_id})`);
            e.statusCode = 400;
            throw e;
        }
        if (rnwlExists.is_aprvd === true) {
            console.error(`Renewal with id(${vapt_rnwl_id}) has already been approved.`);
            const e = new errors_1.AppError(`Renewal with id(${vapt_rnwl_id}) has already been approved.`);
            e.statusCode = 409;
            throw e;
        }
        const approvedRenewal = yield vaptRenewalRepository_1.default.update({ vapt_rnwl_id: vapt_rnwl_id }, {
            is_aprvd: data.is_aprvd,
            hod_remarks: data.hod_remarks,
            status: "APPROVED_BY_HOD",
        });
        if (!approvedRenewal) {
            console.error(`Approval of vapt renewal with id(${vapt_rnwl_id}) by hod failed`);
            const e = new errors_1.AppError(`Failed to approve vapt renewal with id(${vapt_rnwl_id})`);
            throw e;
        }
        // -- MICROSERVICE INTERACTION START --
        // [update vapt details, send notification to relevant parties]
        yield (0, workflowService_1.updateVaptDetails)({
            vapt_id: approvedRenewal.vapt_id,
            new_expiry_date: approvedRenewal.new_vapt_expiry_date,
            new_vapt_report: approvedRenewal.new_vapt_report.toString(),
        });
        // await sendNotification(
        //   WebhookEventType.VAPT_RENEWED,
        //   { emp_no: hod_empno, role: "HOD" },
        //   { domainId: data.dm_id, domainName: "NA Right Now", remarks: data.hod_remarks },
        //   {
        //     drm_emp_no: approvedRenewal.drm_empno_initiator,
        //     arm_emp_no: approvedRenewal.drm_empno_initiator,
        //   }
        // );
        return approvedRenewal;
    }),
    reject: (hod_empno, vapt_rnwl_id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const rnwlExists = yield vaptRenewalRepository_1.default.findById(vapt_rnwl_id);
        if (!rnwlExists) {
            console.error(`No renewal found for vapt renewal id (${vapt_rnwl_id})`);
            const e = new errors_1.AppError(`No renewal found with id (${vapt_rnwl_id}`);
            e.statusCode = 404;
            throw e;
        }
        if (rnwlExists.hod_empno_approver !== hod_empno) {
            console.error(`HOD (${hod_empno}) is not authorized to reject renewal with id ${vapt_rnwl_id}`);
            const e = new errors_1.AppError(`You are not authorized to reject renewal with id ${vapt_rnwl_id}`);
            e.statusCode = 403;
            throw e;
        }
        if (rnwlExists.dm_id !== data.dm_id) {
            const e = new errors_1.AppError(`Invalid domain Id (dm_id:${data.dm_id}) for vapt and vapt renewal.`);
            e.statusCode = 400;
            throw e;
        }
        if (rnwlExists.is_aprvd !== null) {
            console.error(`Renewal with id(${vapt_rnwl_id}) has already been ${rnwlExists.is_aprvd ? "approved" : "rejected"}`);
            const e = new errors_1.AppError(`Renewal with id(${vapt_rnwl_id}) has already been ${rnwlExists.is_aprvd ? "approved" : "rejected"}`);
            e.statusCode = 409;
            throw e;
        }
        const rejectedRenewal = yield vaptRenewalRepository_1.default.update({ vapt_rnwl_id: vapt_rnwl_id }, {
            is_aprvd: false,
            hod_remarks: data.hod_remarks,
            status: "REJECTED_BY_HOD",
        });
        if (!rejectedRenewal) {
            console.error(`Approval of vapt renewal with id(${vapt_rnwl_id}) by hod failed`);
            const e = new errors_1.AppError(`Failed to approve vapt renewal with id(${vapt_rnwl_id})`);
            throw e;
        }
        // -- MCS INT --
        // [Send Notification For Rejection]
        // await sendNotification(
        //   WebhookEventType.VAPT_RENEWAL_REJECTED,
        //   { emp_no: hod_empno, role: "HOD" },
        //   { domainId: data.dm_id, domainName: "NA Right Now", remarks: data.hod_remarks },
        //   {
        //     drm_emp_no: rejectedRenewal.drm_empno_initiator,
        //     arm_emp_no: rejectedRenewal.drm_empno_initiator,
        //   }
        // );
        return rejectedRenewal;
    }),
    review: (drm_empno, vapt_rnwl_id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const rnwlExists = yield vaptRenewalRepository_1.default.findById(vapt_rnwl_id);
        if (!rnwlExists) {
            console.error(`No renewal found for vapt renewal id (${vapt_rnwl_id})`);
            const e = new errors_1.AppError(`No renewal found with id (${vapt_rnwl_id}`);
            e.statusCode = 404;
            throw e;
        }
        if (rnwlExists.drm_empno_initiator !== drm_empno) {
            console.error(`DRM (${drm_empno}) is not authorized to review renewal with id ${vapt_rnwl_id}`);
            const e = new errors_1.AppError(`You are not authorized to reject renewal with id ${vapt_rnwl_id}`);
            e.statusCode = 403;
            throw e;
        }
        if (rnwlExists.is_aprvd === true) {
            console.error(`Renewal with id(${vapt_rnwl_id}) has already been approved`);
            const e = new errors_1.AppError(`Renewal with id(${vapt_rnwl_id}) has already been approved`);
            e.statusCode = 409;
            throw e;
        }
        const reviewedRnwl = yield vaptRenewalRepository_1.default.update({ vapt_rnwl_id: vapt_rnwl_id }, Object.assign(Object.assign({}, data), { status: "PENDING_APPROVAL" }));
        if (!reviewedRnwl) {
            const e = new errors_1.AppError(`Failed to update vapt rnwl with id(${vapt_rnwl_id})`);
            throw new errors_1.AppError("Failed to update vapt renewal");
        }
        // -- MCS INT --
        // [Send notification for successfull rejection]
        // await sendNotification(
        //   WebhookEventType.VAPT_COMPLETED,
        //   { emp_no: reviewedRnwl.drm_empno_initiator, role: "DRM" },
        //   {
        //     domainId: data.dm_id,
        //     domainName: "NA Right Now",
        //     remarks: data.drm_remarks,
        //   },
        //   { hod_emp_no: reviewedRnwl.hod_empno_approver }
        // );
        return reviewedRnwl;
    }),
    getAll: (role, empno, limit) => __awaiter(void 0, void 0, void 0, function* () {
        const renewals = yield vaptRenewalRepository_1.default.findAll(role, empno);
        if (!renewals) {
            const e = new errors_1.AppError(`Failed to fetch vapt rnwls`);
            throw new errors_1.AppError(`Failed to fetch vapt rnwls`);
        }
        return renewals;
    }),
    getById: (empno, vapt_rnwl_id) => __awaiter(void 0, void 0, void 0, function* () {
        const r = yield vaptRenewalRepository_1.default.findById(vapt_rnwl_id);
        if (!r) {
            const e = new errors_1.AppError(`Renewal with id(${vapt_rnwl_id}) not found`);
            e.statusCode = 404;
            throw e;
        }
        if (r.drm_empno_initiator === empno || r.hod_empno_approver === empno) {
            return r;
        }
        else {
            const e = new errors_1.AppError(`You are not authorized to access this renewal`);
            e.statusCode = 404;
            throw e;
        }
    }),
};
exports.default = vaptRenewalService;
