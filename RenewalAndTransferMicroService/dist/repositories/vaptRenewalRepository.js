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
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../database/prisma"));
const vaptRenewalRepository = {
    // Find a running renewal given vapt_id
    findExistingNonApproved: (vapt_id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.default.vaptRenewal.findFirst({
            where: {
                vapt_id,
                status: { not: client_1.VaptRenewalRequestStatus.APPROVED_BY_HOD },
            },
        });
    }),
    // Return renewal count given vapt_id
    countByVaptId: (vapt_id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.default.vaptRenewal.count({ where: { vapt_id } });
    }),
    // Find by vapt_rnwl_id
    findById: (vapt_rnwl_id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.default.vaptRenewal.findUnique({
            where: { vapt_rnwl_id },
        });
    }),
    // Return all renewals for a user
    findAll: (role, empno) => __awaiter(void 0, void 0, void 0, function* () {
        if (role === "DRM")
            return yield prisma_1.default.vaptRenewal.findMany({
                where: { drm_empno_initiator: empno },
            });
        if (role === "HOD")
            return yield prisma_1.default.vaptRenewal.findMany({
                where: { hod_empno_approver: empno },
            });
    }),
    // Update renewal
    update: (where, data) => __awaiter(void 0, void 0, void 0, function* () {
        data = Object.assign(Object.assign({}, data), { aprvl_date: new Date() });
        return yield prisma_1.default.vaptRenewal.update({ where, data });
    }),
    // Create vapt renewal
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.default.vaptRenewal.create({ data });
    }),
};
exports.default = vaptRenewalRepository;
