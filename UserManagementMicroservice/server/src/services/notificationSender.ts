// export const findUserEmailByEmpNo = async (
//   empNo: bigint
// ): Promise<UserInfo | null> => {
//   console.log(`Placeholder: Looking up email for emp_no ${empNo}`);
//   try {
//     const baseUrl = await getServiceBaseUrl("USER-MANAGEMENT-SERVICE");
//     const response = await axios.get(`${baseUrl}/api/users/info/${empNo}`);
//     // const response = await callService(
//     //   "USER-MANAGEMENT-SERVICE",
//     //   `/api/users/info/${empNo}`,
//     //   "GET"
//     // );
//     console.log(response.data);
//     if (response.data) {
//       return {
//         emp_no: response.data.emp_no,
//         email: response.data.usr_email,
//         fname: response.data.usr_fname,
//       };
//     }
//     return null;
//   } catch (error) {
//     console.error(`Error fetching user ${empNo} from User Service:`, error);
//     return null;
//   }
// };
import { eurekaClient } from "../utils/serviceDiscovery";
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
export const findNotificationServiceUrl = async (): Promise<string> => {
  const baseUrl = await getServiceBaseUrl("NOTIFICATION-SERVICE");
  console.log(baseUrl);
  const webhookUrl = `${baseUrl}/api/v1/notify/webhook`;
  console.log(webhookUrl)
  return webhookUrl;
};
