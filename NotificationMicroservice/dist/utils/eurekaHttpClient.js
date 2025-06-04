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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceBaseUrl = void 0;
const serviceDiscovery_1 = require("./serviceDiscovery");
const getServiceBaseUrl = (serviceName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // If service discovery fails throw error
        const instances = serviceDiscovery_1.eurekaClient.getInstancesByAppId(serviceName);
        if (!instances || instances.length === 0) {
            throw new Error(`No instance found for service(${serviceName})`);
        }
        const instance = instances[0];
        // console.log(instance);
        const ipAddr = instance.ipAddr;
        let port;
        if (typeof instance.port === "object" && instance.port !== null) {
            port = instance.port.$ || instance.port.port;
        }
        else {
            port = instance.port;
        }
        if (!port) {
            throw new Error(`Not port found for instance(${instance.instanceId}) of service(${serviceName})`);
        }
        const baseURL = `http://${ipAddr}:${port}`;
        return baseURL;
    }
    catch (error) {
        console.error(` Failed to fetch base url for service(${serviceName})`, error);
        const e = new Error(` Failed to fetch base url for service(${serviceName})\n OriginalError: ${error}`);
        e.name = "ServiceDiscoveryError";
        throw e;
    }
});
exports.getServiceBaseUrl = getServiceBaseUrl;
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
