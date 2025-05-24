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
exports.IpRenewalRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../database/prisma"));
class IpRenewalRepository {
    constructor(prismaClient = prisma_1.default) {
        this.prismaClient = prismaClient;
    }
    countByIpId(ipId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prismaClient.ipRenewal.count({
                    where: { ip_id: ipId },
                });
            }
            catch (error) {
                console.error(`Error counting renewals for ip_id ${ipId}:`, error);
                throw new Error(`Database error while counting renewals.`);
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const renewal = yield this.prismaClient.ipRenewal.create({
                    data: {
                        ip_id: data.ip_id,
                        prev_ip_addrs: data.prev_ip_addrs,
                        aprvl_pdf: data.aprvl_pdf,
                        drm_remarks: data.drm_remarks,
                        rnwl_no: data.rnwl_no,
                    },
                });
                return renewal;
            }
            catch (error) {
                console.error(`Error creating IP renewal:`, error);
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    // Handle known errors
                }
                throw new Error(`Database error while creating renewal.`);
            }
        });
    }
}
exports.IpRenewalRepository = IpRenewalRepository;
