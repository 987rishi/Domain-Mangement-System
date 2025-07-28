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
import logger from "../logging/index";

// @desc   Create a transfer
// @route  /api/transfers/create
// @access Private
export const createTransfer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const empno = req.user.id;
  logger.debug(`Create transfer request received.`, { user: empno });

  const parsed = CreateTransferBodySchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn("Invalid transfer data received from client.", {
      user: empno,
      validationErrors: parsed.error.flatten(),
    });
    const err = new AppError("Invalid transfer data");
    console.log(parsed);
    err.statusCode = 400;
    next(err);
    return;
  }

  try {
    const newTransfer = await transferService.create(
      BigInt(empno),
      parsed.data
    );

    if (!newTransfer) {
      logger.error("Transfer service failed to create a new transfer.", {
        user: empno,
        requestBody: parsed.data,
      });

      const err = new AppError("Failed to create transfer");
      err.statusCode = 500;
      return next(err);
    }

    const response = CreateTransferResponseSchema.safeParse(newTransfer);
    if (!response.success) {
      logger.error(
        "Service returned an invalid transfer object after creation.",
        {
          user: empno,
          serviceResponse: newTransfer,
          validationErrors: response.error.flatten(),
        }
      );
      const err = new AppError(
        "Internal server error: Invalid response from service"
      );
      err.statusCode = 500;
      return next(err);
    }

    logger.info("New transfer created successfully.", {
      user: empno,
      transferId: newTransfer.id,
    });

    res.status(201).json(response.data);
  } catch (error) {
    // Catch any unexpected errors from the service layer.
    logger.error("An unexpected error occurred while creating a transfer.", {
      user: empno,
      requestBody: parsed.data,
      error: error instanceof Error ? error.stack : String(error),
    });

    const err = new AppError("An unexpected error occurred");
    err.statusCode = 500;
    return next(err);
  }
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

  logger.info("TRANSFER APPROVED", {
    user: hod_empno,
    transferDetails: response,
  });

  res.status(200).json(response.data);
};

// @desc Get all transfers for a user (HOD | DRM)Add commentMore actions
// @route GET /api/transfers/:trnsfrId
export const getTransfer: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
// @desc Get all transfers for the logged-in user (as initiator) with pagination
// @route GET /api/transfers
// @query page - The page number to retrieve (default: 0)
// @query size - The number of items per page (default: 20)
// @query sort - The sort order, e.g., "createdAt,desc" (default: "created_at,desc")
export const getTransfers: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use a try...catch block to handle any potential errors gracefully
  try {
    // 1. Get the employee number from the authenticated user
    const empNo = req.user.id;

    // 2. Validate and parse query parameters for pagination, with defaults
    const page = z.coerce.number().default(0).parse(req.query.page);
    const size = z.coerce.number().default(20).parse(req.query.size);
    // Default sort by creation date, newest first
    const sort = z.coerce
      .string()
      .default("created_at,desc")
      .parse(req.query.sort);

    // 3. Call the paginated service.
    // We pass "DRM" as the role because this endpoint implicitly gets transfers
    // where the logged-in user is the initiator (trns_frm), which aligns with
    // the "DRM" case in your repository logic.
    const paginatedTransfers = await transferService.getAll(
      empNo,
      "DRM",
      page,
      size,
      sort
    );

    // 4. Send the response. The service already returns the complete paginated object.
    res.status(200).json(paginatedTransfers);
  } catch (error) {
    // Pass any errors (from Zod parsing or the service) to the error handler
    next(error);
  }
};

// @desc Get all transfers for a user (HOD | DRM) with pagination
// @route GET /api/transfers/all/:role/:id
export const getTransfersByRoleAndId: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use a try...catch block to wrap the entire handler for async errors
  try {
    // 1. Validate and parse path parameters
    const empNo = z.coerce.bigint().parse(req.params.id);
    const role = z
      .string()
      .refine((val) => val === "DRM" || val === "HOD", {
        message: "Invalid Role: Role param can be either HOD or DRM",
      })
      .parse(req.params.role);

    // 2. Validate and parse query parameters for pagination, with defaults
    const page = z.coerce.number().default(0).parse(req.query.page);
    const size = z.coerce.number().default(20).parse(req.query.size);
    // Default sort by creation date, newest first
    const sort = z.coerce
      .string()
      .default("created_at,desc")
      .parse(req.query.sort);

    // 3. Call the service with all parameters
    const paginatedTransfers = await transferService.getAll(
      empNo,
      role as "DRM" | "HOD", // Cast is safe due to Zod validation
      page,
      size,
      sort
    );

    // The service now returns the complete response object.
    // The old `!transfers` check is no longer needed as the service handles it.

    // 4. Send the response
    res.status(200).json(paginatedTransfers);
  } catch (error) {
    // Pass any errors (from Zod parsing or the service) to the error handler
    next(error);
  }
};
