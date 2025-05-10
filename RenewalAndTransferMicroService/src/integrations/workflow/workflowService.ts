import axios, { AxiosError, isAxiosError } from "axios";
import { ZodError } from "zod";
import { getServiceBaseUrl } from "../eureka/eurekaUtils";
import { DomainNameSchema, DomainNameDto, UpdateVaptDto } from "./workflowDTO";

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

export const getDomainDetails = async (
  domainId: bigint
): Promise<DomainNameDto | null> => {
  let url;
  try {
    // Fetch base url for instance of the required service | Might throw
    const baseUrl = await getServiceBaseUrl("workflow-service");
    url = `${baseUrl}/exposedApis/domain/${domainId}`;
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
    console.log(res.data);

    let parsedRes;
    try {
      const parsedResa = DomainNameSchema.safeParse(res.data);
      parsedRes = parsedResa;
    } catch (error) {
      console.error(error as ZodError);
    }
    if (!parsedRes) {
      throw new Error(
        `[getDomainDetails] Failed to parse domain response. ${parsedRes?.error}`
      );
    }
    if (!parsedRes.success) {
      throw new Error(
        `[getDomainDetails] Failed to parse domain response. ${parsedRes.error}`
      );
    }

    return parsedRes.data;
  } catch (error) {
    // Handle Axios Error
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.status === 404) {
        console.log(
          `[getDomainDetails] Domain not found (404) for ID ${domainId}`
        );
        return null;
      } else {
        // Handle other Axios errors (network, timeout, 5xx, etc.)
        const status = axiosError.response?.status ?? "N/A";
        console.error(
          `[getDomainDetails] Axios error fetching domain details: Status ${status}, Message: ${axiosError.message}`,
          axiosError.response?.data // Log response data if available and potentially useful
        );
        throw new Error(
          `Failed to fetch user details via Axios. Status: ${status}, OriginalError: ${axiosError.message}`
        );
      }
    } else {
      // Handle ZodError
      const ze = error as ZodError;
      console.error(
        `[getDomainDetails] Failed to parse response. ${ze.message}`
      );
      throw error;
    }
  }
};

export const updateDomainDetails = async (
  domainId: bigint,
  newDrmEmployeeNumber: bigint
): Promise<boolean | null> => {
  const functionName = "[updateDomainDetails]";
  let url: string;

  // 1. Resolve Service URL
  try {
    const baseUrl = await getServiceBaseUrl("workflow-service");
    url = `${baseUrl}/exposedApis/domain/${domainId.toString()}`;
    console.log(`${functionName} Requesting PATCH URL: ${url}`);
  } catch (error) {
    console.error(
      `${functionName} Failed to get service base URL for workflow-service:`,
      error
    );
    throw new Error(
      `${functionName} Failed to resolve URL for workflow-service. OriginalError: ${
        (error as Error).message
      }`
    );
  }

  // 2. Prepare Request Data - Use the correct field name expected by the API
  const requestData = {
    drm_empno: newDrmEmployeeNumber.toString(),
  };

  // 3. Perform PATCH Request and Handle Response/Errors
  try {
    // Use generic type <DomainNameDto> for expected response type hint
    const res = await axios.patch(url, requestData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return true;
  } catch (error) {
    // Handle Axios-specific errors first
    if (isAxiosError(error)) {
      const axiosError = error;

      // Specific handling for 404 Not Found
      if (axiosError.response && axiosError.response.status === 404) {
        console.log(
          `${functionName} Domain not found (404) for ID ${domainId}. Returning null.`
        );
        return null;
      } else {
        const status = axiosError.response?.status ?? "N/A";
        const responseData = axiosError.response?.data;
        console.error(
          `${functionName} Axios error during domain update: Status ${status}, Message: ${axiosError.message}`,
          responseData
            ? `Response Data: ${JSON.stringify(responseData)}`
            : "(No response data)"
        );
        throw new Error(
          `${functionName} Failed to update domain ${domainId} via API. Status: ${status}. OriginalError: ${axiosError.message}`
        );
      }
    } else {
      console.error(
        `${functionName} An unexpected non-Axios/non-Zod error occurred during domain update:`,
        error
      );
      // Throw a generic error for unexpected issues
      throw new Error(
        `${functionName} An unexpected error occurred: ${
          (error as Error).message
        }`
      );
    }
  }
};

export const getVaptDetailsById = async (vaptId: bigint): Promise<any> => {
  let url;
  try {
    // Fetch base url for instance of the required service | Might throw
    const baseUrl = await getServiceBaseUrl("workflow-service");
    url = `${baseUrl}/exposedApis/vapt/${vaptId}`;
    console.log(url);
  } catch (error) {
    throw new Error(
      `Failed to fetch vapt details:\n OriginalError: ${
        (error as Error).message
      }`
    );
  }

  try {
    // Make a request for some resource | Might throw
    const res = await axios.get(url, {
      headers: { Accept: "application/json" },
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    // Handle Axios Error
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.status === 404) {
        console.log(
          `[getVaptDetailsById] Vapt not found (404) for ID ${vaptId}`
        );
        return null;
      } else {
        // Handle other Axios errors (network, timeout, 5xx, etc.)
        const status = axiosError.response?.status ?? "N/A";
        console.error(
          `[getVaptDetailsById] Axios error fetching vapt details: Status ${status}, Message: ${axiosError.message}`,
          axiosError.response?.data // Log response data if available and potentially useful
        );
        throw new Error(
          `Failed to fetch vapt details via Axios. Status: ${status}, OriginalError: ${axiosError.message}`
        );
      }
    } else {
      console.error(`Unexpected Error: `, error);
      throw error;
    }
  }
};

export const updateVaptDetails = async (
  updateRqstData: UpdateVaptDto
): Promise<boolean | null> => {
  const functionName = "[updateVaptDetails]";
  let url: string;

  // 1. Resolve Service URL
  try {
    const baseUrl = await getServiceBaseUrl("workflow-service");
    url = `${baseUrl}/exposedApis/vapt`;
    console.log(`${functionName} Requesting PATCH URL: ${url}`);
  } catch (error) {
    console.error(
      `${functionName} Failed to get service base URL for workflow-service:`,
      error
    );
    throw new Error(
      `${functionName} Failed to resolve URL for workflow-service. OriginalError: ${
        (error as Error).message
      }`
    );
  }

  // 3. Perform PATCH Request and Handle Response/Errors
  try {
    // Use generic type <DomainNameDto> for expected response type hint
    const res = await axios.put(url, updateRqstData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return true;
  } catch (error) {
    // Handle Axios-specific errors first
    if (isAxiosError(error)) {
      const axiosError = error;

      // Specific handling for 404 Not Found
      if (axiosError.response && axiosError.response.status === 404) {
        console.log(
          `${functionName} VAPT record not found (404) for ID ${updateRqstData.vapt_id}. Returning null.`
        );
        return null;
      } else {
        const status = axiosError.response?.status ?? "N/A";
        const responseData = axiosError.response?.data;
        console.error(
          `${functionName} Axios error during vapt update: Status ${status}, Message: ${axiosError.message}`,
          responseData
            ? `Response Data: ${JSON.stringify(responseData)}`
            : "(No response data)"
        );
        throw new Error(
          `${functionName} Failed to update vapt ${updateRqstData.vapt_id} via API. Status: ${status}. OriginalError: ${axiosError.message}`
        );
      }
    } else {
      console.error(
        `${functionName} An unexpected non-Axios/non-Zod error occurred during domain update:`,
        error
      );
      // Throw a generic error for unexpected issues
      throw new Error(
        `${functionName} An unexpected error occurred: ${
          (error as Error).message
        }`
      );
    }
  }
};

export const getIpDetailsById = async (ipId: bigint): Promise<any> => {
  let url;
  try {
    // Fetch base url for instance of the required service | Might throw
    const baseUrl = await getServiceBaseUrl("workflow-service");
    url = `${baseUrl}/exposedApis/ip/${ipId}`;
    console.log(url);
  } catch (error) {
    throw new Error(
      `Failed to fetch vapt details:\n OriginalError: ${
        (error as Error).message
      }`
    );
  }

  try {
    // Make a request for some resource | Might throw
    const res = await axios.get(url, {
      headers: { Accept: "application/json" },
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    // Handle Axios Error
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.status === 404) {
        console.log(`[getIpDetailsById] IP not found (404) for ID ${ipId}`);
        return null;
      } else {
        // Handle other Axios errors (network, timeout, 5xx, etc.)
        const status = axiosError.response?.status ?? "N/A";
        console.error(
          `[getIpDetailsById] Axios error fetching IP details: Status ${status}, Message: ${axiosError.message}`,
          axiosError.response?.data // Log response data if available and potentially useful
        );
        throw new Error(
          `Failed to fetch IP details via Axios. Status: ${status}, OriginalError: ${axiosError.message}`
        );
      }
    } else {
      console.error(`Unexpected Error: `, error);
      throw error;
    }
  }
};

export const updateIpDetails = async (updateRqstData: {
  ip_id: bigint;
  new_ip_address: string;
  new_expiry_date: Date;
  rnwl_pdf: string;
}): Promise<boolean | null> => {
  const functionName = "[updateIpDetails]";
  let url: string;

  // 1. Resolve Service URL
  try {
    const baseUrl = await getServiceBaseUrl("workflow-service");
    url = `${baseUrl}/exposedApis/ip`;
    console.log(`${functionName} Requesting PATCH URL: ${url}`);
  } catch (error) {
    console.error(
      `${functionName} Failed to get service base URL for workflow-service:`,
      error
    );
    throw new Error(
      `${functionName} Failed to resolve URL for workflow-service. OriginalError: ${
        (error as Error).message
      }`
    );
  }

  // 3. Perform PATCH Request and Handle Response/Errors
  try {
    // Use generic type <DomainNameDto> for expected response type hint
    const res = await axios.put(url, updateRqstData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return true;
  } catch (error) {
    // Handle Axios-specific errors first
    if (isAxiosError(error)) {
      const axiosError = error;

      // Specific handling for 404 Not Found
      if (axiosError.response && axiosError.response.status === 404) {
        console.log(
          `${functionName} IP record not found (404) for ID ${updateRqstData.ip_id}. Returning null.`
        );
        return null;
      } else {
        const status = axiosError.response?.status ?? "N/A";
        const responseData = axiosError.response?.data;
        console.error(
          `${functionName} Axios error during IP update: Status ${status}, Message: ${axiosError.message}`,
          responseData
            ? `Response Data: ${JSON.stringify(responseData)}`
            : "(No response data)"
        );
        throw new Error(
          `${functionName} Failed to update vapt ${updateRqstData.ip_id} via API. Status: ${status}. OriginalError: ${axiosError.message}`
        );
      }
    } else {
      console.error(
        `${functionName} An unexpected non-Axios/non-Zod error occurred during domain update:`,
        error
      );
      // Throw a generic error for unexpected issues
      throw new Error(
        `${functionName} An unexpected error occurred: ${
          (error as Error).message
        }`
      );
    }
  }
};
