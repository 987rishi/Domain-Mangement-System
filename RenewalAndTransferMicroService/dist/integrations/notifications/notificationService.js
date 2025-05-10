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
exports.sendNotification = void 0;
const axios_1 = __importStar(require("axios"));
const eurekaUtils_1 = require("../eureka/eurekaUtils");
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
const sendNotification = (eventType, triggeredBy, data, recipients) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let url;
    try {
        // Fetch base url for instance of the required service | Might throw
        const baseUrl = yield (0, eurekaUtils_1.getServiceBaseUrl)("notification-service");
        url = `${baseUrl}/api/v1/notify/webhook`;
        console.log(url);
    }
    catch (error) {
        throw new Error(`Failed to send Notification:\n OriginalError: ${error.message}`);
    }
    try {
        // Make a request for some resource | Might throw
        const res = yield axios_1.default.get(url, {
            headers: { Accept: "application/json" },
        });
        return true;
    }
    catch (error) {
        // Handle Axios Error
        if ((0, axios_1.isAxiosError)(error)) {
            const axiosError = error;
            if (axiosError.response && axiosError.response.status === 404) {
                console.error(`[sendNotification] Failed to send notification.`);
            }
            else {
                // Handle other Axios errors (network, timeout, 5xx, etc.)
                const status = (_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "N/A";
                console.error(`[sendNotification] Failed to send Notification: Status ${status}, Message: ${axiosError.message}`, (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data // Log response data if available and potentially useful
                );
                throw new Error(`Failed to send Notification. Status: ${status}, OriginalError: ${axiosError.message}`);
            }
        }
        return false;
    }
});
exports.sendNotification = sendNotification;
