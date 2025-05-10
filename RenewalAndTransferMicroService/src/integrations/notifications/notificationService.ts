import axios, { AxiosError, isAxiosError } from "axios";
import { ZodError } from "zod";
import { getServiceBaseUrl } from "../eureka/eurekaUtils";
import {
  NotificationPayloadSchema,
  NotificationPayloadDto,
  NotificationTriggeredByDto,
  NotificationDataDto,
  NotificationRecipientsDto,
  WebhookEventType,
} from "./notificationDTOs";

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
export const sendNotification = async (
  eventType: WebhookEventType,
  triggeredBy: NotificationTriggeredByDto,
  data: NotificationDataDto,
  recipients: NotificationRecipientsDto
): Promise<boolean> => {
  let url;
  try {
    // Fetch base url for instance of the required service | Might throw
    const baseUrl = await getServiceBaseUrl("notification-service");
    url = `${baseUrl}/api/v1/notify/webhook`;
    console.log(url);
  } catch (error) {
    throw new Error(
      `Failed to send Notification:\n OriginalError: ${
        (error as Error).message
      }`
    );
  }

  try {
    // Make a request for some resource | Might throw
    const res = await axios.get(url, {
      headers: { Accept: "application/json" },
    });

    return true;
  } catch (error) {
    // Handle Axios Error
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.status === 404) {
        console.error(`[sendNotification] Failed to send notification.`);
      } else {
        // Handle other Axios errors (network, timeout, 5xx, etc.)
        const status = axiosError.response?.status ?? "N/A";
        console.error(
          `[sendNotification] Failed to send Notification: Status ${status}, Message: ${axiosError.message}`,
          axiosError.response?.data // Log response data if available and potentially useful
        );
        throw new Error(
          `Failed to send Notification. Status: ${status}, OriginalError: ${axiosError.message}`
        );
      }
    }
    return false;
  }
};
