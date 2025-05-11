import prisma from "../config/database.config";
import { UserInfo } from "../types/webhook.types";
import axios from "axios";
import { getServiceBaseUrl } from "../utils/eurekaHttpClient";
// import { callService } from "../utils/eurekaHttpClient";

// ---- VERY IMPORTANT PLACEHOLDER ----
// Replace this with actual logic to fetch user details (email)
// Call your User Management Microservice API




export const findUserEmailByEmpNo = async (
  empNo: bigint
): Promise<UserInfo | null> => {
  console.log(`Placeholder: Looking up email for emp_no ${empNo}`);
  try {
    const baseUrl = await getServiceBaseUrl("USER-MANAGEMENT-SERVICE");
    const response = await axios.get(`${baseUrl}/api/users/info/${empNo}`);
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
  } catch (error) {
    console.error(`Error fetching user ${empNo} from User Service:`, error);
    return null;
  }
};
