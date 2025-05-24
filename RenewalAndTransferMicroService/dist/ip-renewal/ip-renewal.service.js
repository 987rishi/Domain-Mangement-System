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
exports.IpRenewalService = exports.RenewalProcessingError = void 0;
// Custom Error class (Example - remains the same)
class RenewalProcessingError extends Error {
    constructor(message) {
        super(message);
        this.name = "RenewalProcessingError";
    }
}
exports.RenewalProcessingError = RenewalProcessingError;
class IpRenewalService {
    constructor(ipRenewalRepository) {
        this.ipRenewalRepository = ipRenewalRepository;
    }
    // Use the inferred Zod type for the input parameter
    // Return the defined response interface/type
    createIpRenewal(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // 1. Data Transformation & Business Logic
                // input.ip_id is already a bigint thanks to z.coerce.bigint()
                const approvalPdfBuffer = Buffer.from(input.aprvl_pdf, 'base64');
                // Calculate renewal number (Business Logic)
                const count = yield this.ipRenewalRepository.countByIpId(input.ip_id);
                const renewalNumber = BigInt(count + 1);
                // Prepare data for the repository
                const repoInput = {
                    ip_id: input.ip_id, // Already bigint
                    prev_ip_addrs: input.prev_ip_addrs,
                    aprvl_pdf: approvalPdfBuffer,
                    drm_remarks: (_a = input.drm_remarks) !== null && _a !== void 0 ? _a : "NA", // Apply default if optional field is undefined
                    rnwl_no: renewalNumber,
                };
                // 2. Call Repository to Persist
                const createdRenewal = yield this.ipRenewalRepository.create(repoInput);
                // 3. Format Response according to IpRenewalResponseData
                return {
                    ip_rnwl_id: createdRenewal.ip_rnwl_id.toString()
                };
            }
            catch (error) {
                console.error("Service Error in createIpRenewal:", error);
                if (error instanceof Error && error.message.includes("Database error")) {
                    throw new RenewalProcessingError(`Failed to save renewal data. ${error.message}`);
                }
                throw new RenewalProcessingError(`An unexpected error occurred during renewal creation: ${error.message}`);
            }
        });
    }
}
exports.IpRenewalService = IpRenewalService;
