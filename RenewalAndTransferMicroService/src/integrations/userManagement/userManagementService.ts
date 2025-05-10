import axios, { AxiosError, isAxiosError } from "axios";
import { ZodError } from "zod";
import { getServiceBaseUrl } from "../eureka/eurekaUtils";
import { UserRoles } from "./userManagementTypes";
import {
  DrmDetailsSchema,
  HodDetailsSchema,
  NetopsDetailsSchema,
  ArmDetailsSchema,
  DrmDetailsDto,
  HodDetailsDto,
  NetopsDetailsDto,
  ArmDetailsDto,
} from "./userManagementDTOs";
import { parse } from "path";

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
export const getUserDetails = async (
  role: UserRoles,
  userId: bigint
): Promise<
  DrmDetailsDto | HodDetailsDto | NetopsDetailsDto | ArmDetailsDto | null
> => {
  let url;
  try {
    // Fetch base url for instance of the required service | Might throw
    const baseUrl = await getServiceBaseUrl("user-management-service");
    url = `${baseUrl}/api/users/details/${role}/${userId}`;
    console.log(url);
  } catch (error) {
    throw new Error(
      `Failed to fetch user details:\n OriginalError: ${
        (error as Error).message
      }`
    );
  }

  try {
    // Make a request for some resource | Might throw
    const res = await axios.get(url, {
      headers: { Accept: "application/json" },
    });
    // console.log(res.data);

    let parsedRes;
    if (role === UserRoles.DRM) {
      parsedRes = DrmDetailsSchema.safeParse(res.data);
    } else if (role === UserRoles.HOD) {
      parsedRes = HodDetailsSchema.safeParse(res.data);
    } else if (role === UserRoles.NETOPS) {
      parsedRes = NetopsDetailsSchema.safeParse(res.data);
    } /* ARM */ else {
      parsedRes = ArmDetailsSchema.safeParse(res.data);
    }
    console.log(parsedRes.data);

    if (!parsedRes.success) {
      throw new Error(
        `[getUserDetails] Invalid user details response object. ${parsedRes.error} `
      );
    }
    return parsedRes.data;
  } catch (error) {
    // Handle Axios Error
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.status === 404) {
        console.log(
          `[getUserDetails] User not found (404) for ID ${userId}, Role ${role}. Returning null.`
        );
        return null;
      } else {
        // Handle other Axios errors (network, timeout, 5xx, etc.)
        const status = axiosError.response?.status ?? "N/A";
        console.error(
          `[getUserDetails] Axios error fetching user details: Status ${status}, Message: ${axiosError.message}`,
          axiosError.response?.data // Log response data if available and potentially useful
        );
        throw new Error(
          `Failed to fetch user details via Axios. Status: ${status}, OriginalError: ${axiosError.message}`
        );
      }
    } else {
      // Handle ZodError
      const ze = error as ZodError;
      console.error(`[getUserDetails] Failed to parse response. ${ze}`);
      throw error;
    }
  }
};

// Fetches users supervisors from user-management-service
// Assumes that the user is valid(id obtained from token)
export const getUsersSupervisors = async (
  role: "DRM",
  userId: bigint
): Promise<any> => {
  let url;
  try {
    // Fetch base url for instance of the required service | Might throw
    const baseUrl = await getServiceBaseUrl("user-management-service");
    url = `${baseUrl}/api/users/${userId}/officials`;
    console.log(url);
  } catch (error) {
    throw new Error(
      `Failed to fetch user supervisors:\n OriginalError: ${
        (error as Error).message
      }`
    );
  }

  try {
    // Make a request for some resource | Might throw
    const res = await axios.get(url, {
      headers: { Accept: "application/json" },
    });
    console.log("SUPERVISORS RECEIVED: ", res.data);
    return res.data;
  } catch (error) {
    // Handle Axios Error
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.status === 404) {
        console.log(
          `[getUsersSupervisors] User not found (404) for ID ${userId}, Role ${role}. Returning null.`
        );
        return null;
      } else {
        // Handle other Axios errors (network, timeout, 5xx, etc.)
        const status = axiosError.response?.status ?? "N/A";
        console.error(
          `[getUsersSupervisors] Axios error fetching user details: Status ${status}, Message: ${axiosError.message}`,
          axiosError.response?.data // Log response data if available and potentially useful
        );
        throw new Error(
          `Failed to fetch user details via Axios. Status: ${status}, OriginalError: ${axiosError.message}`
        );
      }
    }
  }
};
