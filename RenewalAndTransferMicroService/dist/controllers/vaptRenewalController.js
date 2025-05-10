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
exports.createVaptRenewal = exports.getVaptRenewalsParamsVersion = exports.getVaptRenewals = exports.getVaptRenewal = exports.reviewVaptRenewal = exports.rejectVaptRenewal = exports.approveVaptRenewal = void 0;
const zod_1 = __importDefault(require("zod"));
const vaptRenewalValidators_1 = require("../validators/vaptRenewalValidators");
const vaptRenewalService_1 = __importDefault(require("../services/vaptRenewalService"));
const errors_1 = require("../errors");
// @desc Creates a vapt renewal
// @route POST /api/renwals/vapt/create
// @access Private
const createVaptRenewal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = vaptRenewalValidators_1.CreateVaptRenewalBodySchema.safeParse(req.body);
    const drm_empno = BigInt(req.user.id);
    if (!parsed.success) {
        console.error("Input validation failed.", `Error: ${parsed.error}`);
        const e = new errors_1.AppError("Invalid input fields");
        e.statusCode = 400;
        throw e;
    }
    const rnwl = yield vaptRenewalService_1.default.create(drm_empno, parsed.data);
    if (!rnwl) {
        console.error(`Failed to create renewal.`, `Error: ${rnwl}`);
        const e = new errors_1.AppError("Failed to create renewal");
        e.statusCode = 500;
        throw e;
    }
    const response = vaptRenewalValidators_1.VaptRenewalResponseSchema.safeParse(rnwl);
    if (!response.success) {
        res.status(400).json({ error: response.error });
        return;
    }
    res.status(201).json(response.data);
    return;
});
exports.createVaptRenewal = createVaptRenewal;
// @desc Approves a pending vapt renewal
// @route POST /api/renwals/vapt/:vaptRnwlId/approve
// @access Private
const approveVaptRenewal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hod_empno = BigInt(req.user.id);
    const vapt_rnwl_id = BigInt(req.params.vaptRnwlId);
    const parsed = vaptRenewalValidators_1.VaptRenewalHodActionBodySchema.safeParse(req.body);
    if (!parsed.success) {
        console.error("Input validation failed.", `Error: ${parsed.error}`);
        const e = new errors_1.AppError("Invalid input fields");
        e.statusCode = 400;
        throw e;
    }
    const approvedRenewal = yield vaptRenewalService_1.default.approve(hod_empno, vapt_rnwl_id, parsed.data);
    if (!approvedRenewal) {
        console.error(`Failed to approve renewal.`);
        const e = new errors_1.AppError("Failed to approve renewal");
        e.statusCode = 500;
        throw e;
    }
    const response = vaptRenewalValidators_1.VaptRenewalResponseSchema.safeParse(approvedRenewal);
    res.status(200).json(response.data);
});
exports.approveVaptRenewal = approveVaptRenewal;
// @desc Approves a pending vapt renewal
// @route POST /api/renwals/vapt/:vaptRnwlId/reject
// @access Private
const rejectVaptRenewal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const hod_empno = BigInt(req.user.id); // TODO Replace with req.user.id
    const vapt_rnwl_id = BigInt(req.params.vaptRnwlId);
    const parsed = vaptRenewalValidators_1.VaptRenewalHodActionBodySchema.safeParse(req.body);
    if (!parsed.success) {
        console.error("Input validation failed.", `Error: ${parsed.error}`);
        const e = new errors_1.AppError("Invalid input fields");
        e.statusCode = 400;
        throw e;
    }
    const rejectedRenewal = yield vaptRenewalService_1.default.reject(hod_empno, vapt_rnwl_id, parsed.data);
    if (!rejectedRenewal) {
        console.error(`Failed to approve renewal.`);
        const e = new errors_1.AppError("Failed to approve renewal");
        e.statusCode = 500;
        throw e;
    }
    const response = vaptRenewalValidators_1.VaptRenewalResponseSchema.safeParse(rejectedRenewal);
    res.status(200).json(response.data);
});
exports.rejectVaptRenewal = rejectVaptRenewal;
// @desc Approves a pending vapt renewal
// @route POST /api/renwals/vapt/:vaptRnwlId/review
// @access Private
const reviewVaptRenewal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const drm_empno = BigInt(req.user.id); // TODO Replace with req.user.id
    const vapt_rnwl_id = BigInt(req.params.vaptRnwlId);
    const parsed = vaptRenewalValidators_1.VaptRenewalReviewBodySchema.safeParse(req.body);
    if (!parsed.success) {
        console.error("Input validation failed.", `Error: ${parsed.error}`);
        const e = new errors_1.AppError("Invalid input fields");
        e.statusCode = 400;
        throw e;
    }
    const reviewedRnwl = yield vaptRenewalService_1.default.review(drm_empno, vapt_rnwl_id, parsed.data);
    if (!reviewedRnwl) {
        console.error(`Failed to update(review) renewal.`);
        const e = new errors_1.AppError("Failed to update(review) renewal");
        e.statusCode = 500;
        throw e;
    }
    const response = vaptRenewalValidators_1.VaptRenewalResponseSchema.safeParse(reviewedRnwl);
    res.status(200).json(response.data);
});
exports.reviewVaptRenewal = reviewVaptRenewal;
const getVaptRenewal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vapt_rnwl_id = BigInt(req.params.vaptRnwlId);
    const empno = BigInt(req.user.id); // TODO Replace with req.user.id
    const renewal = yield vaptRenewalService_1.default.getById(empno, vapt_rnwl_id);
    if (!renewal) {
        throw new errors_1.AppError(`Failed to load vapt renewal`);
    }
    const response = vaptRenewalValidators_1.VaptRenewalResponseSchema.safeParse(renewal);
    if (!response) {
        throw new errors_1.AppError(`Failed to parse response`);
    }
    res.status(200).json(response.data);
});
exports.getVaptRenewal = getVaptRenewal;
const getVaptRenewals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const empno = zod_1.default.bigint().parse(req.user.id);
    const renewals = yield vaptRenewalService_1.default.getAll(req.user.role, empno);
    if (!renewals) {
        console.error(`Failed to fetch renewals for user with id (${empno})`);
        throw new errors_1.AppError("Failed to load renewals");
    }
    const response = renewals.map((r) => vaptRenewalValidators_1.VaptRenewalResponseSchema.safeParse(r).data);
    res.status(200).json(response);
});
exports.getVaptRenewals = getVaptRenewals;
const getVaptRenewalsParamsVersion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let empno, role;
    try {
        empno = zod_1.default.coerce.bigint().parse(req.params.id);
        if (req.params.role === "HOD" || req.params.role === "DRM") {
            role = req.params.role;
        }
        else {
            const e = new errors_1.AppError(`Invalid role param in the path. Ex: role ("HOD" or "DRM")`);
            e.statusCode = 400;
            throw e;
        }
    }
    catch (error) {
        res.status(400).json(`Bad params: ${error.message}`);
        return;
    }
    const renewals = yield vaptRenewalService_1.default.getAll(role, empno);
    if (!renewals) {
        console.error(`Failed to fetch renewals for user with id (${empno})`);
        throw new errors_1.AppError("Failed to load renewals");
    }
    const response = renewals.map((r) => vaptRenewalValidators_1.VaptRenewalResponseSchema.safeParse(r).data);
    res.status(200).json(response);
});
exports.getVaptRenewalsParamsVersion = getVaptRenewalsParamsVersion;
