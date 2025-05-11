import axios, { Method, AxiosRequestConfig } from "axios";
import { eurekaClient } from "./serviceDiscovery";



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
// export function discoverService(appName: string): string | null {
//   const instances = eurekaClient.getInstancesByAppId(appName.toUpperCase());
//   if (!instances || instances.length === 0) return null;

//   const upInstances = instances.filter(i => i.status === "UP");
//   const instance = (upInstances.length ? upInstances : instances)[Math.floor(Math.random() * instances.length)];
//   return `http://${instance.ipAddr}:${instance.port.$}`;
// }
// export async function callService<T = any>(
//   appName: string,
//   path: string,
//   method: Method = "GET",
//   options: {
//     params?: any;
//     data?: any;
//     headers?: Record<string, string>;
//   } = {}
// ): Promise<T> {
//   const baseUrl = await getServiceBaseUrl(appName);
//   if (!baseUrl) throw new Error(`Service ${appName} not found in Eureka`);

//   const config: AxiosRequestConfig = {
//     method,
//     url: `${baseUrl}${path}`,
//     params: options.params,
//     data: options.data,
//     headers: options.headers,
//   };

//   const response = await axios.request<T>(config);
//   return response.data;
// }
