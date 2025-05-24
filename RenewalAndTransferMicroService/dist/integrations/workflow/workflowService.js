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
exports.updateIpDetails = exports.getIpDetailsById = exports.updateVaptDetails = exports.getVaptDetailsById = exports.updateDomainDetails = exports.getDomainDetails = void 0;
const axios_1 = __importStar(require("axios"));
const eurekaUtils_1 = require("../eureka/eurekaUtils");
const workflowDTO_1 = require("./workflowDTO");
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
const getDomainDetails = (domainId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let url;
    try {
        // Fetch base url for instance of the required service | Might throw
        const baseUrl = yield (0, eurekaUtils_1.getServiceBaseUrl)("workflow-service");
        url = `${baseUrl}/exposedApis/domain/${domainId}`;
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
        console.log(res.data);
        let parsedRes;
        try {
            const parsedResa = workflowDTO_1.DomainNameSchema.safeParse(res.data);
            parsedRes = parsedResa;
        }
        catch (error) {
            console.error(error);
        }
        if (!parsedRes) {
            throw new Error(`[getDomainDetails] Failed to parse domain response. ${parsedRes === null || parsedRes === void 0 ? void 0 : parsedRes.error}`);
        }
        if (!parsedRes.success) {
            throw new Error(`[getDomainDetails] Failed to parse domain response. ${parsedRes.error}`);
        }
        return parsedRes.data;
    }
    catch (error) {
        // Handle Axios Error
        if ((0, axios_1.isAxiosError)(error)) {
            const axiosError = error;
            if (axiosError.response && axiosError.response.status === 404) {
                console.log(`[getDomainDetails] Domain not found (404) for ID ${domainId}`);
                return null;
            }
            else {
                // Handle other Axios errors (network, timeout, 5xx, etc.)
                const status = (_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "N/A";
                console.error(`[getDomainDetails] Axios error fetching domain details: Status ${status}, Message: ${axiosError.message}`, (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data // Log response data if available and potentially useful
                );
                throw new Error(`Failed to fetch user details via Axios. Status: ${status}, OriginalError: ${axiosError.message}`);
            }
        }
        else {
            // Handle ZodError
            const ze = error;
            console.error(`[getDomainDetails] Failed to parse response. ${ze.message}`);
            throw error;
        }
    }
});
exports.getDomainDetails = getDomainDetails;
const updateDomainDetails = (domainId, newDrmEmployeeNumber) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const functionName = "[updateDomainDetails]";
    let url;
    // 1. Resolve Service URL
    try {
        const baseUrl = yield (0, eurekaUtils_1.getServiceBaseUrl)("workflow-service");
        url = `${baseUrl}/exposedApis/domain/${domainId.toString()}`;
        console.log(`${functionName} Requesting PATCH URL: ${url}`);
    }
    catch (error) {
        console.error(`${functionName} Failed to get service base URL for workflow-service:`, error);
        throw new Error(`${functionName} Failed to resolve URL for workflow-service. OriginalError: ${error.message}`);
    }
    // 2. Prepare Request Data - Use the correct field name expected by the API
    const requestData = {
        drm_empno: newDrmEmployeeNumber.toString(),
    };
    // 3. Perform PATCH Request and Handle Response/Errors
    try {
        // Use generic type <DomainNameDto> for expected response type hint
        const res = yield axios_1.default.patch(url, requestData, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        return true;
    }
    catch (error) {
        // Handle Axios-specific errors first
        if ((0, axios_1.isAxiosError)(error)) {
            const axiosError = error;
            // Specific handling for 404 Not Found
            if (axiosError.response && axiosError.response.status === 404) {
                console.log(`${functionName} Domain not found (404) for ID ${domainId}. Returning null.`);
                return null;
            }
            else {
                const status = (_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "N/A";
                const responseData = (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data;
                console.error(`${functionName} Axios error during domain update: Status ${status}, Message: ${axiosError.message}`, responseData
                    ? `Response Data: ${JSON.stringify(responseData)}`
                    : "(No response data)");
                throw new Error(`${functionName} Failed to update domain ${domainId} via API. Status: ${status}. OriginalError: ${axiosError.message}`);
            }
        }
        else {
            console.error(`${functionName} An unexpected non-Axios/non-Zod error occurred during domain update:`, error);
            // Throw a generic error for unexpected issues
            throw new Error(`${functionName} An unexpected error occurred: ${error.message}`);
        }
    }
});
exports.updateDomainDetails = updateDomainDetails;
const getVaptDetailsById = (vaptId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let url;
    try {
        // Fetch base url for instance of the required service | Might throw
        const baseUrl = yield (0, eurekaUtils_1.getServiceBaseUrl)("workflow-service");
        url = `${baseUrl}/exposedApis/vapt/${vaptId}`;
        console.log(url);
    }
    catch (error) {
        throw new Error(`Failed to fetch vapt details:\n OriginalError: ${error.message}`);
    }
    try {
        // Make a request for some resource | Might throw
        const res = yield axios_1.default.get(url, {
            headers: { Accept: "application/json" },
        });
        console.log(res.data);
        return res.data;
    }
    catch (error) {
        // Handle Axios Error
        if ((0, axios_1.isAxiosError)(error)) {
            const axiosError = error;
            if (axiosError.response && axiosError.response.status === 404) {
                console.log(`[getVaptDetailsById] Vapt not found (404) for ID ${vaptId}`);
                return null;
            }
            else {
                // Handle other Axios errors (network, timeout, 5xx, etc.)
                const status = (_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "N/A";
                console.error(`[getVaptDetailsById] Axios error fetching vapt details: Status ${status}, Message: ${axiosError.message}`, (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data // Log response data if available and potentially useful
                );
                throw new Error(`Failed to fetch vapt details via Axios. Status: ${status}, OriginalError: ${axiosError.message}`);
            }
        }
        else {
            console.error(`Unexpected Error: `, error);
            throw error;
        }
    }
});
exports.getVaptDetailsById = getVaptDetailsById;
const updateVaptDetails = (updateRqstData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const functionName = "[updateVaptDetails]";
    let url;
    // 1. Resolve Service URL
    try {
        const baseUrl = yield (0, eurekaUtils_1.getServiceBaseUrl)("workflow-service");
        url = `${baseUrl}/exposedApis/vapt`;
        console.log(`${functionName} Requesting PATCH URL: ${url}`);
    }
    catch (error) {
        console.error(`${functionName} Failed to get service base URL for workflow-service:`, error);
        throw new Error(`${functionName} Failed to resolve URL for workflow-service. OriginalError: ${error.message}`);
    }
    // 3. Perform PATCH Request and Handle Response/Errors
    try {
        // Use generic type <DomainNameDto> for expected response type hint
        const res = yield axios_1.default.put(url, updateRqstData, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        return true;
    }
    catch (error) {
        // Handle Axios-specific errors first
        if ((0, axios_1.isAxiosError)(error)) {
            const axiosError = error;
            // Specific handling for 404 Not Found
            if (axiosError.response && axiosError.response.status === 404) {
                console.log(`${functionName} VAPT record not found (404) for ID ${updateRqstData.vapt_id}. Returning null.`);
                return null;
            }
            else {
                const status = (_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "N/A";
                const responseData = (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data;
                console.error(`${functionName} Axios error during vapt update: Status ${status}, Message: ${axiosError.message}`, responseData
                    ? `Response Data: ${JSON.stringify(responseData)}`
                    : "(No response data)");
                throw new Error(`${functionName} Failed to update vapt ${updateRqstData.vapt_id} via API. Status: ${status}. OriginalError: ${axiosError.message}`);
            }
        }
        else {
            console.error(`${functionName} An unexpected non-Axios/non-Zod error occurred during domain update:`, error);
            // Throw a generic error for unexpected issues
            throw new Error(`${functionName} An unexpected error occurred: ${error.message}`);
        }
    }
});
exports.updateVaptDetails = updateVaptDetails;
const getIpDetailsById = (ipId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let url;
    try {
        // Fetch base url for instance of the required service | Might throw
        const baseUrl = yield (0, eurekaUtils_1.getServiceBaseUrl)("workflow-service");
        url = `${baseUrl}/exposedApis/ip/${ipId}`;
        console.log(url);
    }
    catch (error) {
        throw new Error(`Failed to fetch vapt details:\n OriginalError: ${error.message}`);
    }
    try {
        // Make a request for some resource | Might throw
        const res = yield axios_1.default.get(url, {
            headers: { Accept: "application/json" },
        });
        console.log(res.data);
        return res.data;
    }
    catch (error) {
        // Handle Axios Error
        if ((0, axios_1.isAxiosError)(error)) {
            const axiosError = error;
            if (axiosError.response && axiosError.response.status === 404) {
                console.log(`[getIpDetailsById] IP not found (404) for ID ${ipId}`);
                return null;
            }
            else {
                // Handle other Axios errors (network, timeout, 5xx, etc.)
                const status = (_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "N/A";
                console.error(`[getIpDetailsById] Axios error fetching IP details: Status ${status}, Message: ${axiosError.message}`, (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data // Log response data if available and potentially useful
                );
                throw new Error(`Failed to fetch IP details via Axios. Status: ${status}, OriginalError: ${axiosError.message}`);
            }
        }
        else {
            console.error(`Unexpected Error: `, error);
            throw error;
        }
    }
});
exports.getIpDetailsById = getIpDetailsById;
const updateIpDetails = (updateRqstData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const functionName = "[updateIpDetails]";
    let url;
    // 1. Resolve Service URL
    try {
        const baseUrl = yield (0, eurekaUtils_1.getServiceBaseUrl)("workflow-service");
        url = `${baseUrl}/exposedApis/ip`;
        console.log(`${functionName} Requesting PATCH URL: ${url}`);
    }
    catch (error) {
        console.error(`${functionName} Failed to get service base URL for workflow-service:`, error);
        throw new Error(`${functionName} Failed to resolve URL for workflow-service. OriginalError: ${error.message}`);
    }
    // 3. Perform PATCH Request and Handle Response/Errors
    try {
        // Use generic type <DomainNameDto> for expected response type hint
        const res = yield axios_1.default.put(url, updateRqstData, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        return true;
    }
    catch (error) {
        // Handle Axios-specific errors first
        if ((0, axios_1.isAxiosError)(error)) {
            const axiosError = error;
            // Specific handling for 404 Not Found
            if (axiosError.response && axiosError.response.status === 404) {
                console.log(`${functionName} IP record not found (404) for ID ${updateRqstData.ip_id}. Returning null.`);
                return null;
            }
            else {
                const status = (_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "N/A";
                const responseData = (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data;
                console.error(`${functionName} Axios error during IP update: Status ${status}, Message: ${axiosError.message}`, responseData
                    ? `Response Data: ${JSON.stringify(responseData)}`
                    : "(No response data)");
                throw new Error(`${functionName} Failed to update vapt ${updateRqstData.ip_id} via API. Status: ${status}. OriginalError: ${axiosError.message}`);
            }
        }
        else {
            console.error(`${functionName} An unexpected non-Axios/non-Zod error occurred during domain update:`, error);
            // Throw a generic error for unexpected issues
            throw new Error(`${functionName} An unexpected error occurred: ${error.message}`);
        }
    }
});
exports.updateIpDetails = updateIpDetails;
