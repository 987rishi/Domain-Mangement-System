import { transferService } from "../services/transferService";
import { NextFunction, Request, Response, RequestHandler } from "express";
import {
  CreateTransferBodySchema,
  CreateTransferResponseSchema,
  ApproveTransferBodySchema,
  ApproveTransferParamsSchema,
} from "../validators/transferValidators";
import { AppError } from "../errors";

// @desc   Create a transfer
// @route  /api/transfers/create
// @access Private
export const createTransfer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const parsed = CreateTransferBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const err = new AppError("Invalid transfer data");
    err.statusCode = 400;
    next(err);
    return;
  }

  let newTransfer = await transferService.create(parsed.data);

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
  // 1. Parse the params and input
  const hod_empno = /* BigInt(req.user.id) || */ BigInt(1);
  const tt_id = req.params.trnsfrId;
  const params = ApproveTransferParamsSchema.safeParse({
    tt_id,
  });
  const body = ApproveTransferBodySchema.safeParse(req.body);
  console.log(req.params);

  if (!params.success || !body.success || body.data.hod_approved == false) {
    console.log(`Input validation failded:\n${params.error}\n${body.error}`);
    const e = new AppError(`Invalid input fields`);
    e.statusCode = 400;
    throw e;
  }

  // 2. Approve the transfer
  const approvedTransfer = await transferService.approve(
    params.data,
    body.data,
    hod_empno
  );

  if (!approvedTransfer) {
    const err = new AppError("Failed to approve transfer");
    err.statusCode = 500;
    next(err);
    return;
  }

  // 3. prepare and send the response
  let response = CreateTransferResponseSchema.safeParse(approvedTransfer);
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
  // TODO Get the employee number from the req
  const emp_no = /* Bigint(req.user.id) || */ BigInt(101);
  const transfers = await transferService.getAll(emp_no);

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
  const emp_no = /* Bigint(req.user.id) || */ BigInt(1);
  let trnsfrId: bigint;
  try {
    trnsfrId = BigInt(req.params.trnsfrId);
  } catch (error) {
    const e = new AppError("Transfer Id must be a number");
    e.statusCode = 400;
    throw e;
  }

  const transfer = await transferService.getById(trnsfrId, emp_no);

  if (!transfer) {
    const e = new AppError("Failed to fetch the transfer");
    e.statusCode = 400;
    throw e;
  }

  const response = CreateTransferResponseSchema.safeParse(transfer);
  res.status(200).json(response.data);
};
