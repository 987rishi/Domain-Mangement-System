"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getUsersSupervisors = exports.getUserDetails = void 0;
const axios_1 = __importStar(require("axios"));
const eurekaUtils_1 = require("../eureka/eurekaUtils");
const userManagementTypes_1 = require("./userManagementTypes");
const userManagementDTOs_1 = require("./userManagementDTOs");
/**
 * Fetches the details of a user from the user-management-service.
 *
 * @param role - The role of the user (e.g. DRM, HOD, ARM, NETOPS)
 * @param userId - The ID of the user to fetch details for
 *
 * @returns The user details as a JSON object or null if user not found
 *
 * @throws {Error} If user-management-service is not available
 * @throws {AxiosError} If Axios encounters an error while making the request
 */
const getUserDetails = (role, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let url;
    try {
        // Fetch base url for instance of the required service | Might throw
        const baseUrl = yield (0, eurekaUtils_1.getServiceBaseUrl)("user-management-service");
        url = `${baseUrl}/api/users/details/${role}/${userId}`;
        console.log(url);
    }
    catch (error) {
        throw new Error(`Failed to fetch user details:\n OriginalError: ${error.message}`);
    }
    try {
        // Make a request for some resource | Might throw
        const res = yield axios_1.default.get(url, {
            headers: { Accept: "application/json" },
        });
        // console.log(res.data);
        let parsedRes;
        if (role === userManagementTypes_1.UserRoles.DRM) {
            parsedRes = userManagementDTOs_1.DrmDetailsSchema.safeParse(res.data);
        }
        else if (role === userManagementTypes_1.UserRoles.HOD) {
            parsedRes = userManagementDTOs_1.HodDetailsSchema.safeParse(res.data);
        }
        else if (role === userManagementTypes_1.UserRoles.NETOPS) {
            parsedRes = userManagementDTOs_1.NetopsDetailsSchema.safeParse(res.data);
        } /* ARM */
        else {
            parsedRes = userManagementDTOs_1.ArmDetailsSchema.safeParse(res.data);
        }
        console.log(parsedRes.data);
        if (!parsedRes.success) {
            throw new Error(`[getUserDetails] Invalid user details response object. ${parsedRes.error} `);
        }
        return parsedRes.data;
    }
    catch (error) {
        // Handle Axios Error
        if ((0, axios_1.isAxiosError)(error)) {
            const axiosError = error;
            if (axiosError.response && axiosError.response.status === 404) {
                console.log(`[getUserDetails] User not found (404) for ID ${userId}, Role ${role}. Returning null.`);
                return null;
            }
            else {
                // Handle other Axios errors (network, timeout, 5xx, etc.)
                const status = (_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "N/A";
                console.error(`[getUserDetails] Axios error fetching user details: Status ${status}, Message: ${axiosError.message}`, (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data // Log response data if available and potentially useful
                );
                throw new Error(`Failed to fetch user details via Axios. Status: ${status}, OriginalError: ${axiosError.message}`);
            }
        }
        else {
            // Handle ZodError
            const ze = error;
            console.error(`[getUserDetails] Failed to parse response. ${ze}`);
            throw error;
        }
    }
});
exports.getUserDetails = getUserDetails;
// Fetches users supervisors from user-management-service
// Assumes that the user is valid(id obtained from token)
const getUsersSupervisors = (role, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let url;
    try {
        // Fetch base url for instance of the required service | Might throw
        const baseUrl = yield (0, eurekaUtils_1.getServiceBaseUrl)("user-management-service");
        url = `${baseUrl}/api/users/${userId}/officials`;
        console.log(url);
    }
    catch (error) {
        throw new Error(`Failed to fetch user supervisors:\n OriginalError: ${error.message}`);
    }
    try {
        // Make a request for some resource | Might throw
        const res = yield axios_1.default.get(url, {
            headers: { Accept: "application/json" },
        });
        console.log("SUPERVISORS RECEIVED: ", res.data);
        return res.data;
    }
    catch (error) {
        // Handle Axios Error
        if ((0, axios_1.isAxiosError)(error)) {
            const axiosError = error;
            if (axiosError.response && axiosError.response.status === 404) {
                console.log(`[getUsersSupervisors] User not found (404) for ID ${userId}, Role ${role}. Returning null.`);
                return null;
            }
            else {
                // Handle other Axios errors (network, timeout, 5xx, etc.)
                const status = (_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "N/A";
                console.error(`[getUsersSupervisors] Axios error fetching user details: Status ${status}, Message: ${axiosError.message}`, (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data // Log response data if available and potentially useful
                );
                throw new Error(`Failed to fetch user details via Axios. Status: ${status}, OriginalError: ${axiosError.message}`);
            }
        }
    }
});
exports.getUsersSupervisors = getUsersSupervisors;
