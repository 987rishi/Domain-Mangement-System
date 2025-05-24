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
exports.transferRepository = void 0;
const prisma_1 = __importDefault(require("../database/prisma"));
exports.transferRepository = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.default.transfer.create({ data });
    }),
    getById: (tt_id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.default.transfer.findUnique({ where: { tt_id } });
    }),
    getByDomainId: (dm_id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.default.transfer.findMany({ where: { dm_id } });
    }),
    getAll: (empNo, role) => __awaiter(void 0, void 0, void 0, function* () {
        if (role === "HOD") {
            return yield prisma_1.default.transfer.findMany({ where: { hod_empno: empNo } });
        }
        return yield prisma_1.default.transfer.findMany({ where: { trns_frm: empNo } });
    }),
    approve: (where, data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        data.approved_at = (_a = data.approved_at) !== null && _a !== void 0 ? _a : new Date();
        return yield prisma_1.default.transfer.update({ where, data });
    }),
};
