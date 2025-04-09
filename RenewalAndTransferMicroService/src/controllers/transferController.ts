import { transferService } from "../services/transferService";
import { NextFunction, Request, Response, RequestHandler } from "express";
import prisma from "../database/prisma";
import dummyDB from "../../dummyDB.json";
import { TransferResponse } from "../types/transfer.interface";
import eurekaClient from "../registry/eurekaClient";
import {
  CreateTransferBodySchema,
  CreateTransferResponseSchema,
  ApproveTransferBodySchema
} from "../validators/transferValidators";
import { AppError } from "../errors";

// @desc   Create a transfer
// @route  /api/transfers/create
// @access Private
export const createTransfer = async (req, res, next): Promise<void> => {
  const parsed = CreateTransferBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const err = new AppError("Invalid transfer data");
    err.statusCode = 400;
    next(err);
    return;
  }

  let newRenewal = await transferService.create(parsed.data);

  if (!newRenewal) {
    const err = new AppError("Failed to create transfer");
    err.statusCode = 500;
    next(err);
    return;
  }
  let response = CreateTransferResponseSchema.safeParse(newRenewal);

  res.status(200).json(response);
};

// @desc Approve a transfer
// @route PUT /api/transfers/:trnsfrId/create
export const approveTransfer: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tt_id = parseInt(req.params.trnsfrId);
  const { emp_no } = req.body;
  if (!emp_no && !tt_id) {
    res.status(400).send("Please add all fields");
  }

  // 1. Check if it's from HOD
  const isValidHOD = emp_no;
  if (!isValidHOD) {
    res.status(401).send("Authentication error");
  }

  let transfer = await prisma.transfer.findUnique({ where: { tt_id: tt_id } });
  if (!transfer) {
    res.status(400).send("No valid transfer for corresponding transfer ID.");
  }

  transfer = await prisma.transfer.update({
    where: { tt_id: tt_id },
    data: { hod_approved: true, approved_at: new Date() },
  });

  res.status(200).send({ tt_id: transfer.tt_id.toString() });
};

// @desc Get all transfers for a user (HOD | DRM)
// @route GET /api/transfers
// ? For a authenticated request we can obtain the id from the response. Should we check again for the auth user in database?
export const getTransfers: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const emp_no = parseInt(String(req.headers.authorization));

  const drm = dummyDB.DRM.find((drm) => drm.emp_no == emp_no);
  if (!drm) {
    res.status(401).send("Authentication error");
  }

  const transfers = await prisma.transfer.findMany({
    where: { trns_frm: emp_no },
  });
  const transfersResponse: TransferResponse[] = transfers.map((t) => {
    const safeT: TransferResponse = {
      ...t,
      dm_id: t.dm_id.toString(),
      tt_id: t.tt_id.toString(),
      trns_frm: t.trns_frm.toString(),
      trns_to: t.trns_to.toString(),
      prf_upload: Buffer.from(t.prf_upload).toString("base64"),
    };
    return safeT;
  });

  res.status(200).send(transfersResponse);
};

// @desc Get all transfers for a user (HOD | DRM)
// @route GET /api/transfers/:trnsfrId
export const getTransfer: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const emp_no = parseInt(String(req.headers.authorization));
  const tt_id = parseInt(req.params.trnsfrId);

  const drm = dummyDB.DRM.find((drm) => drm.emp_no == emp_no);
  if (!drm) {
    res.status(401).send("Authentication error");
    return;
  }

  if (isNaN(emp_no)) {
    res.status(400).send("Invalid transfer id");
    return;
  }

  const transfer = await prisma.transfer.findUnique({
    where: { tt_id: tt_id },
  });
  if (!transfer) {
    res.status(404).send("Transfer not found");
    return;
  }

  const safeTransfer: TransferResponse = {
    ...transfer,
    tt_id: transfer.tt_id.toString(),
    dm_id: transfer.dm_id.toString(),
    trns_frm: transfer.trns_frm.toString(),
    trns_to: transfer.trns_to.toString(),
    prf_upload: Buffer.from(transfer.prf_upload).toString("base64"),
  };

  res.status(200).send(safeTransfer);
};
