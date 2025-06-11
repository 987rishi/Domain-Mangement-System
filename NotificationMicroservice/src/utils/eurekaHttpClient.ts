import axios, { Method, AxiosRequestConfig } from "axios";
import { eurekaClient } from "./serviceDiscovery";


/**
 * Dynamically resolves the base URL of a registered microservice using its service name (App ID) from Eureka.
 *
 * @remarks
 * This function is crucial for inter-service communication. It queries the Eureka client for all available
 * instances of a given service, selects the first one, and constructs its base HTTP address.
 *
 * The logic for extracting the port is designed to be resilient, handling two common structures for the
 * `port` property (`instance.port.$` or `instance.port`) to accommodate potential variations in the
 * Eureka client's response format.
 *
 * @param serviceName - The application ID of the target service as registered in Eureka (e.g., 'USER-MANAGEMENT-SERVICE').
 * @returns A promise that resolves to the base URL string (e.g., 'http://10.0.1.5:8080').
 * @throws Throws a custom 'ServiceDiscoveryError' if:
 *  - No instances are found for the given `serviceName`.
 *  - An instance is found, but its port cannot be determined.
 *  - Any other unexpected error occurs during the lookup process.
 *
 * @example
 * ```
 * try {
 *   const userServiceUrl = await getServiceBaseUrl('USER-MANAGEMENT-SERVICE');
 *   // Now you can use axios or another client with this URL
 *   const response = await axios.get(`${userServiceUrl}/api/users/123`);
 * } catch (error) {
 *   console.error('Failed to contact User Service:', error.message);
 * }
 * ```
 */
const getServiceBaseUrl = async (serviceName: string): Promise<any> => {
  try {
    // If service discovery fails throw error
    const instances = eurekaClient.getInstancesByAppId(serviceName);
    if (!instances || instances.length === 0) {
      throw new Error(`No instance found for service(${serviceName})`);
    }
    const instance = instances[0];
    // console.log(instance);
    const ipAddr = instance.ipAddr;

    let port: any;
    if (typeof instance.port === "object" && instance.port !== null) {
      port = (instance.port as any).$ || (instance.port as any).port;
    } else {
      port = instance.port;
    }

    if (!port) {
      throw new Error(
        `Not port found for instance(${instance.instanceId}) of service(${serviceName})`
      );
    }

    const baseURL = `http://${ipAddr}:${port}`;
    return baseURL;
  } catch (error) {
    console.error(
     ` Failed to fetch base url for service(${serviceName})`,
      error
    );
    const e = new Error(
     ` Failed to fetch base url for service(${serviceName})\n OriginalError: ${error}`
    );
    e.name = "ServiceDiscoveryError";
    throw e;
  }
};

export { getServiceBaseUrl };

