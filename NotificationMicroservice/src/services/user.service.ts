/**
 * @file This service acts as a client for the User Management microservice.
 * It is responsible for fetching user details, such as email and name, by making
 * API calls to the dynamically discovered service endpoint via Eureka.
 */
import prisma from "../config/database.config";
import { UserInfo } from "../types/webhook.types";
import axios from "axios";
import { getServiceBaseUrl } from "../utils/eurekaHttpClient";
// import { callService } from "../utils/eurekaHttpClient";

// ---- VERY IMPORTANT PLACEHOLDER ----
// Replace this with actual logic to fetch user details (email)
// Call your User Management Microservice API

/**
 * Fetches user details (email and first name) from the User Management microservice.
 *
 * @remarks
 * This function performs the following steps:
 * 1. It calls `getServiceBaseUrl` to dynamically resolve the base URL of the 'USER-MANAGEMENT-SERVICE' from Eureka.
 * 2. It makes an HTTP GET request to the `/api/users/info/{empNo}` endpoint of that service using `axios`.
 * 3. On a successful response, it maps the data to the local {@link UserInfo} type.
 * 4. If the service call fails (e.g., network error, 404 Not Found), it logs the error and returns `null`.
 *
 * @param empNo - The unique employee number (as a BigInt) of the user to look up.
 * @returns A promise that resolves to a `UserInfo` object containing the user's details,
 * or `null` if the user could not be found or an error occurred during the API call.
 *
 * @example
 * ```
 * const userInfo = await findUserEmailByEmpNo(12345n);
 * if (userInfo) {
 *   console.log(`User email: ${userInfo.email}`);
 *   // Use userInfo.fname, userInfo.emp_no etc.
 * } else {
 *   console.log('User not found or service is down.');
 * }
 * ```
 */
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
      return {
        emp_no: response.data.emp_no,
        email: response.data.usr_email,
        fname: response.data.usr_fname,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching user ${empNo} from User Service:`, error);
    return null;
  }
};
