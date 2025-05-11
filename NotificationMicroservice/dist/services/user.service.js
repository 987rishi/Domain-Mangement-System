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
exports.findUserEmailByEmpNo = void 0;
const axios_1 = __importDefault(require("axios"));
const eurekaHttpClient_1 = require("../utils/eurekaHttpClient");
// import { callService } from "../utils/eurekaHttpClient";
// ---- VERY IMPORTANT PLACEHOLDER ----
// Replace this with actual logic to fetch user details (email)
// Call your User Management Microservice API
const findUserEmailByEmpNo = (empNo) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Placeholder: Looking up email for emp_no ${empNo}`);
    try {
        const baseUrl = yield (0, eurekaHttpClient_1.getServiceBaseUrl)("USER-MANAGEMENT-SERVICE");
        const response = yield axios_1.default.get(`${baseUrl}/api/users/info/${empNo}`);
        // const response = await callService(
        //   "USER-MANAGEMENT-SERVICE",
        //   `/api/users/info/${empNo}`,
        //   "GET"
        // );
        console.log(response.data);
        if (response.data) {
            return { emp_no: response.data.emp_no, email: response.data.usr_email, fname: response.data.usr_fname };
        }
        return null;
    }
    catch (error) {
        console.error(`Error fetching user ${empNo} from User Service:`, error);
        return null;
    }
});
exports.findUserEmailByEmpNo = findUserEmailByEmpNo;
