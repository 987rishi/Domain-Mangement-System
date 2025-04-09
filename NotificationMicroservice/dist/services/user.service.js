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
const database_config_1 = __importDefault(require("../config/database.config"));
// ---- VERY IMPORTANT PLACEHOLDER ----
// Replace this with actual logic to fetch user details (email)
// Option A: Call your User Management Microservice API
// Option B: Query your shared User database directly (if applicable)
// const MOCK_USER_DB: { [key: number]: UserInfo } = {
//   123: { emp_no: 123, email: "drm_user@example.com", fname: "DRM" },
//   456: { emp_no: 456, email: "arm_user@example.com", fname: "ARM" },
//   789: { emp_no: 789, email: "hod_user@example.com", fname: "HoD" },
//   // Add more mock users as needed
// };
const findUserEmailByEmpNo = (empNo) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Placeholder: Looking up email for emp_no ${empNo}`);
    const user = yield database_config_1.default.user.findUnique({
        where: {
            emp_no: empNo
        }
    });
    if (user) {
        return {
            emp_no: user.emp_no,
            email: user.usr_email,
            fname: user.usr_fname,
            role: user.role
        };
    }
    else {
        console.warn(`Placeholder: User ${empNo} not exist.`);
        return null;
    }
    // In reality:
    // try {
    //   const response = await axios.get(`http://user-service/api/v1/users/${empNo}/details`);
    //   if (response.data) {
    //     return { emp_no: response.data.emp_no, email: response.data.email_id, fname: response.data.fname };
    //   }
    //   return null;
    // } catch (error) {
    //   console.error(`Error fetching user ${empNo} from User Service:`, error);
    //   return null;
    // }
});
exports.findUserEmailByEmpNo = findUserEmailByEmpNo;
