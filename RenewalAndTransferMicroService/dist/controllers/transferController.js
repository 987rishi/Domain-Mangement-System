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
exports.getTransfersByRoleAndId = exports.getTransfer = exports.getTransfers = exports.approveTransfer = exports.createTransfer = void 0;
const transferService_1 = require("../services/transferService");
const transferValidators_1 = require("../validators/transferValidators");
const errors_1 = require("../errors");
const zod_1 = require("zod");
// @desc   Create a transfer
// @route  /api/transfers/create
// @access Private
const createTransfer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("CONTROLLER START".red);
    const empno = req.user.id;
    const parsed = transferValidators_1.CreateTransferBodySchema.safeParse(req.body);
    if (!parsed.success) {
        const err = new errors_1.AppError("Invalid transfer data");
        err.statusCode = 400;
        next(err);
        return;
    }
    let newTransfer = yield transferService_1.transferService.create(BigInt(empno), parsed.data);
    if (!newTransfer) {
        const err = new errors_1.AppError("Failed to create transfer");
        err.statusCode = 500;
        next(err);
        return;
    }
    let response = transferValidators_1.CreateTransferResponseSchema.safeParse(newTransfer);
    res.status(200).json(response.data);
});
exports.createTransfer = createTransfer;
// @desc Approve a transfer
// @route PUT /api/transfers/:trnsfrId/approve
const approveTransfer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const hod_empno = req.user.id;
    let trnsfrId;
    try {
        trnsfrId = zod_1.z.coerce.bigint().parse(req.params.trnsfrId);
    }
    catch (error) {
        const e = new errors_1.AppError(`Invalid trnsfrId(/api/transfers/${req.params.trnsfrId}). Transfer Id must be a number.`);
        e.statusCode = 400;
        throw e;
    }
    console.log("trnsfrId: ".red, trnsfrId);
    const body = transferValidators_1.ApproveTransferBodySchema.safeParse(req.body);
    if (!body.success) {
        console.log(`Input validation failded:${body.error}`);
        const e = new errors_1.AppError(`Invalid input fields`);
        e.statusCode = 400;
        throw e;
    }
    console.log("body: ".red, body);
    // 2. Approve the transfer
    const approvedTransfer = yield transferService_1.transferService.approve(trnsfrId, hod_empno, body.data);
    if (!approvedTransfer) {
        const err = new errors_1.AppError("Failed to approve transfer");
        err.statusCode = 500;
        next(err);
        return;
    }
    // 3. prepare and send the response
    let response = transferValidators_1.CreateTransferResponseSchema.safeParse(approvedTransfer);
    console.log("RESPONSE: ", response.data);
    console.log("Parsed Response: ", response.error);
    res.status(200).json(response.data);
});
exports.approveTransfer = approveTransfer;
// @desc Get all transfers for a user (HOD | DRM)
// @route GET /api/transfers
const getTransfers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const empNo = req.user.id;
    const transfers = yield transferService_1.transferService.getAll(empNo);
    if (!transfers) {
        const e = new errors_1.AppError("Failed to fetch the transfers");
        e.statusCode = 400;
        throw e;
    }
    const response = transfers.map((t) => transferValidators_1.CreateTransferResponseSchema.safeParse(t).data);
    res.status(200).json(response);
});
exports.getTransfers = getTransfers;
// @desc Get all transfers for a user (HOD | DRM)
// @route GET /api/transfers/:trnsfrId
const getTransfer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO Get the employee number from the req
    const empNo = req.user.id;
    let trnsfrId;
    try {
        trnsfrId = zod_1.z.coerce.bigint().parse(req.params.trnsfrId);
    }
    catch (error) {
        const e = new errors_1.AppError(`Invalid trnsfrId(/api/transfers/${req.params.trnsfrId}). Transfer Id must be a number.`);
        e.statusCode = 400;
        throw e;
    }
    const transfer = yield transferService_1.transferService.getById(trnsfrId, empNo);
    if (!transfer) {
        const e = new errors_1.AppError("Failed to fetch the transfer");
        e.statusCode = 400;
        throw e;
    }
    const response = transferValidators_1.CreateTransferResponseSchema.safeParse(transfer);
    res.status(200).json(response.data);
});
exports.getTransfer = getTransfer;
// @desc Get all transfers for a user (HOD | DRM)
// @route GET /api/transfers/all/:role:id
const getTransfersByRoleAndId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const e = new errors_1.AppError("");
    let empNo;
    let role;
    try {
        empNo = zod_1.z.coerce.bigint().parse(req.params.id);
        role = zod_1.z.coerce.string().parse(req.params.role);
        if (role !== "DRM" && role !== "HOD") {
            e.message =
                "Invalid Params: Invalid role Param: Role param can be either HOD or DRM";
            e.statusCode = 400;
            throw e;
        }
    }
    catch (error) {
        throw error;
    }
    const transfers = yield transferService_1.transferService.getAll(empNo, role);
    if (!transfers) {
        const e = new errors_1.AppError("Failed to fetch the transfers");
        e.statusCode = 400;
        throw e;
    }
    const response = transfers.map((t) => transferValidators_1.CreateTransferResponseSchema.safeParse(t).data);
    // console.log(response);
    res.status(200).json(response);
});
exports.getTransfersByRoleAndId = getTransfersByRoleAndId;
