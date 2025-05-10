import { NextFunction, Request, Response } from "express";
import z from "zod";
import { VaptRenewalRequestStatus } from "@prisma/client";
import {
  CreateVaptRenewalBodySchema,
  VaptRenewalHodActionBodySchema,
  VaptRenewalResponseSchema,
  VaptRenewalReviewBodySchema,
} from "../validators/vaptRenewalValidators";
import vaptRenewalService from "../services/vaptRenewalService";
import { AppError } from "../errors";

// @desc Creates a vapt renewal
// @route POST /api/renwals/vapt/create
// @access Private
const createVaptRenewal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = CreateVaptRenewalBodySchema.safeParse(req.body);
  const drm_empno = BigInt(req.user.id);

  if (!parsed.success) {
    console.error("Input validation failed.", `Error: ${parsed.error}`);
    const e = new AppError("Invalid input fields");
    e.statusCode = 400;
    throw e;
  }

  const rnwl = await vaptRenewalService.create(drm_empno, parsed.data);

  if (!rnwl) {
    console.error(`Failed to create renewal.`, `Error: ${rnwl}`);
    const e = new AppError("Failed to create renewal");
    e.statusCode = 500;
    throw e;
  }

  const response = VaptRenewalResponseSchema.safeParse(rnwl);
  if (!response.success) {
    res.status(400).json({ error: response.error });
    return;
  }
  res.status(201).json(response.data);
  return;
};

// @desc Approves a pending vapt renewal
// @route POST /api/renwals/vapt/:vaptRnwlId/approve
// @access Private
export const approveVaptRenewal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const hod_empno = BigInt(req.user.id);
  const vapt_rnwl_id = BigInt(req.params.vaptRnwlId);
  const parsed = VaptRenewalHodActionBodySchema.safeParse(req.body);
  if (!parsed.success) {
    console.error("Input validation failed.", `Error: ${parsed.error}`);
    const e = new AppError("Invalid input fields");
    e.statusCode = 400;
    throw e;
  }

  const approvedRenewal = await vaptRenewalService.approve(
    hod_empno,
    vapt_rnwl_id,
    parsed.data
  );

  if (!approvedRenewal) {
    console.error(`Failed to approve renewal.`);
    const e = new AppError("Failed to approve renewal");
    e.statusCode = 500;
    throw e;
  }

  const response = VaptRenewalResponseSchema.safeParse(approvedRenewal);

  res.status(200).json(response.data);
};

// @desc Approves a pending vapt renewal
// @route POST /api/renwals/vapt/:vaptRnwlId/reject
// @access Private
export const rejectVaptRenewal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const hod_empno = BigInt(req.user.id); // TODO Replace with req.user.id
  const vapt_rnwl_id = BigInt(req.params.vaptRnwlId);
  const parsed = VaptRenewalHodActionBodySchema.safeParse(req.body);
  if (!parsed.success) {
    console.error("Input validation failed.", `Error: ${parsed.error}`);
    const e = new AppError("Invalid input fields");
    e.statusCode = 400;
    throw e;
  }

  const rejectedRenewal = await vaptRenewalService.reject(
    hod_empno,
    vapt_rnwl_id,
    parsed.data
  );

  if (!rejectedRenewal) {
    console.error(`Failed to approve renewal.`);
    const e = new AppError("Failed to approve renewal");
    e.statusCode = 500;
    throw e;
  }

  const response = VaptRenewalResponseSchema.safeParse(rejectedRenewal);

  res.status(200).json(response.data);
};

// @desc Approves a pending vapt renewal
// @route POST /api/renwals/vapt/:vaptRnwlId/review
// @access Private
export const reviewVaptRenewal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const drm_empno = BigInt(req.user.id); // TODO Replace with req.user.id
  const vapt_rnwl_id = BigInt(req.params.vaptRnwlId);
  const parsed = VaptRenewalReviewBodySchema.safeParse(req.body);
  if (!parsed.success) {
    console.error("Input validation failed.", `Error: ${parsed.error}`);
    const e = new AppError("Invalid input fields");
    e.statusCode = 400;
    throw e;
  }

  const reviewedRnwl = await vaptRenewalService.review(
    drm_empno,
    vapt_rnwl_id,
    parsed.data
  );

  if (!reviewedRnwl) {
    console.error(`Failed to update(review) renewal.`);
    const e = new AppError("Failed to update(review) renewal");
    e.statusCode = 500;
    throw e;
  }

  const response = VaptRenewalResponseSchema.safeParse(reviewedRnwl);

  res.status(200).json(response.data);
};

export const getVaptRenewal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const vapt_rnwl_id = BigInt(req.params.vaptRnwlId);
  const empno = BigInt(req.user.id); // TODO Replace with req.user.id

  const renewal = await vaptRenewalService.getById(empno, vapt_rnwl_id);
  if (!renewal) {
    throw new AppError(`Failed to load vapt renewal`);
  }

  const response = VaptRenewalResponseSchema.safeParse(renewal);
  if (!response) {
    throw new AppError(`Failed to parse response`);
  }
  res.status(200).json(response.data);
};

export const getVaptRenewals = async (
  req: Request,
  res: Response
): Promise<void> => {
  const empno = z.bigint().parse(req.user.id);

  const renewals = await vaptRenewalService.getAll(req.user.role, empno);
  if (!renewals) {
    console.error(`Failed to fetch renewals for user with id (${empno})`);
    throw new AppError("Failed to load renewals");
  }
  const response = renewals.map(
    (r) => VaptRenewalResponseSchema.safeParse(r).data
  );
  res.status(200).json(response);
};

export const getVaptRenewalsParamsVersion = async (
  req: Request,
  res: Response
): Promise<void> => {
  let empno, role: "DRM" | "HOD";
  try {
    empno = z.coerce.bigint().parse(req.params.id);

    if (req.params.role === "HOD" || req.params.role === "DRM") {
      role = req.params.role;
    } else {
      const e = new AppError(
        `Invalid role param in the path. Ex: role ("HOD" or "DRM")`
      );
      e.statusCode = 400;
      throw e;
    }
  } catch (error) {
    res.status(400).json(`Bad params: ${(error as Error).message}`);
    return;
  }

  const renewals = await vaptRenewalService.getAll(role, empno);
  if (!renewals) {
    console.error(`Failed to fetch renewals for user with id (${empno})`);
    throw new AppError("Failed to load renewals");
  }
  const response = renewals.map(
    (r) => VaptRenewalResponseSchema.safeParse(r).data
  );
  res.status(200).json(response);
};

export { createVaptRenewal };
