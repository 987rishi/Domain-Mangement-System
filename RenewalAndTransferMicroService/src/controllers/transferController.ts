import { transferService } from "../services/transferService";
import { NextFunction, Request, Response, RequestHandler } from "express";
import {
  CreateTransferBodySchema,
  CreateTransferResponseSchema,
  ApproveTransferBodySchema,
  ApproveTransferParamsSchema,
} from "../validators/transferValidators";
import { AppError } from "../errors";
import { z } from "zod";

// @desc   Create a transfer
// @route  /api/transfers/create
// @access Private
export const createTransfer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("CONTROLLER START".red);
  const empno = req.user.id;
  const parsed = CreateTransferBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const err = new AppError("Invalid transfer data");
    err.statusCode = 400;
    next(err);
    return;
  }

  let newTransfer = await transferService.create(BigInt(empno), parsed.data);

  if (!newTransfer) {
    const err = new AppError("Failed to create transfer");
    err.statusCode = 500;
    next(err);
    return;
  }
  let response = CreateTransferResponseSchema.safeParse(newTransfer);

  res.status(200).json(response.data);
};

// @desc Approve a transfer
// @route PUT /api/transfers/:trnsfrId/approve
export const approveTransfer: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const hod_empno = req.user.id;

  let trnsfrId;
  try {
    trnsfrId = z.coerce.bigint().parse(req.params.trnsfrId);
  } catch (error) {
    const e = new AppError(
      `Invalid trnsfrId(/api/transfers/${req.params.trnsfrId}). Transfer Id must be a number.`
    );
    e.statusCode = 400;
    throw e;
  }
  console.log("trnsfrId: ".red, trnsfrId);

  const body = ApproveTransferBodySchema.safeParse(req.body);
  if (!body.success) {
    console.log(`Input validation failded:${body.error}`);
    const e = new AppError(`Invalid input fields`);
    e.statusCode = 400;
    throw e;
  }
  console.log("body: ".red, body);

  // 2. Approve the transfer
  const approvedTransfer = await transferService.approve(
    trnsfrId,
    hod_empno,
    body.data
  );

  if (!approvedTransfer) {
    const err = new AppError("Failed to approve transfer");
    err.statusCode = 500;
    next(err);
    return;
  }

  // 3. prepare and send the response
  let response = CreateTransferResponseSchema.safeParse(approvedTransfer);
  console.log("RESPONSE: ", response.data);
  console.log("Parsed Response: ", response.error);
  res.status(200).json(response.data);
};

// @desc Get all transfers for a user (HOD | DRM)
// @route GET /api/transfers
export const getTransfers: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const empNo = req.user.id;
  const transfers = await transferService.getAll(empNo);

  if (!transfers) {
    const e = new AppError("Failed to fetch the transfers");
    e.statusCode = 400;
    throw e;
  }

  const response = transfers.map(
    (t) => CreateTransferResponseSchema.safeParse(t).data
  );
  res.status(200).json(response);
};

// @desc Get all transfers for a user (HOD | DRM)
// @route GET /api/transfers/:trnsfrId
export const getTransfer: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO Get the employee number from the req
  const empNo = req.user.id;
  let trnsfrId: bigint;
  try {
    trnsfrId = z.coerce.bigint().parse(req.params.trnsfrId);
  } catch (error) {
    const e = new AppError(
      `Invalid trnsfrId(/api/transfers/${req.params.trnsfrId}). Transfer Id must be a number.`
    );
    e.statusCode = 400;
    throw e;
  }

  const transfer = await transferService.getById(trnsfrId, empNo);

  if (!transfer) {
    const e = new AppError("Failed to fetch the transfer");
    e.statusCode = 400;
    throw e;
  }

  const response = CreateTransferResponseSchema.safeParse(transfer);
  res.status(200).json(response.data);
};

// @desc Get all transfers for a user (HOD | DRM)
// @route GET /api/transfers/all/:role:id
export const getTransfersByRoleAndId: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const e = new AppError("");
  let empNo: bigint;
  let role: string;
  try {
    empNo = z.coerce.bigint().parse(req.params.id);
    role = z.coerce.string().parse(req.params.role);
    if (role !== "DRM" && role !== "HOD") {
      e.message =
        "Invalid Params: Invalid role Param: Role param can be either HOD or DRM";
      e.statusCode = 400;
      throw e;
    }
  } catch (error) {
    throw error;
  }

  const transfers = await transferService.getAll(empNo, role);

  if (!transfers) {
    const e = new AppError("Failed to fetch the transfers");
    e.statusCode = 400;
    throw e;
  }

  const response = transfers.map(
    (t) => CreateTransferResponseSchema.safeParse(t).data
  );
  // console.log(response);
  res.status(200).json(response);
};
