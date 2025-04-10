import { AppError } from "../errors";
import vaptRenewalRepository from "../repositories/vaptRenewalRepository";
import {
  CreateVaptRenewalBodyDTO,
  VaptRenewalHodActionBodySchema,
  VaptRenewalHodActionDTO,
  VaptRenewalReviewBodyDTO,
} from "../validators/vaptRenewalValidators";

const vaptRenewalService = {
  create: async (drm_empno: bigint, data: CreateVaptRenewalBodyDTO) => {
    const exists = await vaptRenewalRepository.findExistingNonApproved(
      data.vapt_id
    );
    if (exists) {
      console.error(`Found active vapt renewal for vapt id (${data.vapt_id})`);
      const e = new AppError(
        `Found active renewal for vapt with id (${data.vapt_id})`
      );
      e.statusCode = 409;
      throw e;
    }

    // -- PLACEHOLDER FETCHS START--
    const rnwl_no = BigInt(
      (await vaptRenewalRepository.countByVaptId(data.vapt_id)) + 1
    );
    const old_vapt_report = data.new_vapt_report; // TODO From DomainName Mcs
    const hod_empno = drm_empno + BigInt(1000); // TODO From UserManagement Mcs
    // -- PLACEHOLDER FETCHS END --

    const newRnwl = await vaptRenewalRepository.create({
      ...data,
      created_by_drm: drm_empno,
      aprvd_by_hod: hod_empno,
      rnwl_no: rnwl_no,
      old_vapt_report,
    });

    if (!newRnwl) {
      console.error(`Failed to create renewal for vapt id ${data.vapt_id}`);
      const e = new AppError("Failed to create vapt renewal");
      e.statusCode = 500;
      throw e;
    }

    return newRnwl;
  },

  approve: async (
    hod_empno: bigint,
    vapt_rnwl_id: bigint,
    data: VaptRenewalHodActionDTO
  ) => {
    const rnwlExists = await vaptRenewalRepository.findById(vapt_rnwl_id);
    if (!rnwlExists) {
      console.error(`No renewal found for vapt renewal id (${vapt_rnwl_id})`);
      const e = new AppError(`No renewal with id(${vapt_rnwl_id}) found`);
      e.statusCode = 404;
      throw e;
    }

    if (rnwlExists.aprvd_by_hod !== hod_empno) {
      console.error(
        `HOD (${hod_empno}) is not authorized to approve renewal with id ${vapt_rnwl_id}`
      );
      const e = new AppError(
        `You are not authorized to approve renewal with id ${vapt_rnwl_id}`
      );
      e.statusCode = 403;
      throw e;
    }

    if (rnwlExists.hod_aprvd === true) {
      console.error(
        `Renewal with id(${vapt_rnwl_id}) has already been approved.`
      );
      const e = new AppError(
        `Renewal with id(${vapt_rnwl_id}) has already been approved.`
      );
      e.statusCode = 409;
      throw e;
    }

    const approvedRenewal = await vaptRenewalRepository.update(
      { vapt_rnwl_id: vapt_rnwl_id },
      {
        hod_aprvd: data.hod_aprvd,
        hod_remarks: data.hod_remarks,
        status: "APPROVED_BY_HOD",
      }
    );

    if (!approvedRenewal) {
      console.error(
        `Approval of vapt renewal with id(${vapt_rnwl_id}) by hod failed`
      );
      const e = new AppError(
        `Failed to approve vapt renewal with id(${vapt_rnwl_id})`
      );
      throw e;
    }

    return approvedRenewal;
  },

  reject: async (
    hod_empno: bigint,
    vapt_rnwl_id: bigint,
    data: VaptRenewalHodActionDTO
  ) => {
    const rnwlExists = await vaptRenewalRepository.findById(vapt_rnwl_id);
    if (!rnwlExists) {
      console.error(`No renewal found for vapt renewal id (${vapt_rnwl_id})`);
      const e = new AppError(`No renewal found with id (${vapt_rnwl_id}`);
      e.statusCode = 404;
      throw e;
    }

    if (rnwlExists.aprvd_by_hod !== hod_empno) {
      console.error(
        `HOD (${hod_empno}) is not authorized to reject renewal with id ${vapt_rnwl_id}`
      );
      const e = new AppError(
        `You are not authorized to reject renewal with id ${vapt_rnwl_id}`
      );
      e.statusCode = 403;
      throw e;
    }

    if (rnwlExists.hod_aprvd !== null) {
      console.error(
        `Renewal with id(${vapt_rnwl_id}) has already been ${
          rnwlExists.hod_aprvd ? "approved" : "rejected"
        }`
      );
      const e = new AppError(
        `Renewal with id(${vapt_rnwl_id}) has already been ${
          rnwlExists.hod_aprvd ? "approved" : "rejected"
        }`
      );
      e.statusCode = 409;
      throw e;
    }

    const rejectedRenewal = await vaptRenewalRepository.update(
      { vapt_rnwl_id: vapt_rnwl_id },
      {
        hod_aprvd: data.hod_aprvd ? false : false,
        hod_remarks: data.hod_remarks,
        status: "REJECTED_BY_HOD",
      }
    );

    if (!rejectedRenewal) {
      console.error(
        `Approval of vapt renewal with id(${vapt_rnwl_id}) by hod failed`
      );
      const e = new AppError(
        `Failed to approve vapt renewal with id(${vapt_rnwl_id})`
      );
      throw e;
    }

    return rejectedRenewal;
  },

  review: async (
    drm_empno: bigint,
    vapt_rnwl_id: bigint,
    data: VaptRenewalReviewBodyDTO
  ) => {
    const rnwlExists = await vaptRenewalRepository.findById(vapt_rnwl_id);
    if (!rnwlExists) {
      console.error(`No renewal found for vapt renewal id (${vapt_rnwl_id})`);
      const e = new AppError(`No renewal found with id (${vapt_rnwl_id}`);
      e.statusCode = 404;
      throw e;
    }

    if (rnwlExists.created_by_drm !== drm_empno) {
      console.error(
        `DRM (${drm_empno}) is not authorized to review renewal with id ${vapt_rnwl_id}`
      );
      const e = new AppError(
        `You are not authorized to reject renewal with id ${vapt_rnwl_id}`
      );
      e.statusCode = 403;
      throw e;
    }

    if (rnwlExists.hod_aprvd === true) {
      console.error(
        `Renewal with id(${vapt_rnwl_id}) has already been approved`
      );
      const e = new AppError(
        `Renewal with id(${vapt_rnwl_id}) has already been approved`
      );
      e.statusCode = 409;
      throw e;
    }

    const reviewedRnwl = await vaptRenewalRepository.update(
      { vapt_rnwl_id: vapt_rnwl_id },
      { ...data, status: "PENDING_APPROVAL" }
    );

    if (!reviewedRnwl) {
      const e = new AppError(
        `Failed to update vapt rnwl with id(${vapt_rnwl_id})`
      );
      throw new AppError("Failed to update vapt renewal");
    }

    return reviewedRnwl;
  },

  getAll: async (empno: bigint, limit?: number) => {
    let role: "DRM" | "HOD";

    // -- PLACEHOLDER FETCHES START --
    role = "DRM"; // TODO Fetch role from user management microservice
    // -- PLACEHOLDER FETCHES END --

    const renewals = await vaptRenewalRepository.findAll(role, empno);
    if (!renewals) {
      const e = new AppError(`Failed to fetch vapt rnwls`);
      throw new AppError(`Failed to fetch vapt rnwls`);
    }
    return renewals;
  },

  getById: async (empno: bigint, vapt_rnwl_id: bigint) => {
    const r = await vaptRenewalRepository.findById(vapt_rnwl_id);
    if (!r) {
      const e = new AppError(`Renewal with id(${vapt_rnwl_id}) not found`);
      e.statusCode = 404;
      throw e;
    }

    if (r.created_by_drm === empno || r.aprvd_by_hod === empno) {
      return r;
    } else {
      const e = new AppError(`You are not authorized to access this renewal`);
      e.statusCode = 404;
      throw e;
    }
  },
};

export default vaptRenewalService;
