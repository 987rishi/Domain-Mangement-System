import { Request, Response } from "express";
import { WebhookPayload, UserInfo } from "../types/webhook.types";
import { sendEmail, createEmailContent  } from "../services/email.service";
import { createDbNotification } from "../services/notificationDb.service";
// Placeholder for fetching user email - replace with actual logic
import { findUserEmailByEmpNo } from "../services/user.service"; // Assume this exists


/**
 * Handles incoming webhook requests to trigger user notifications.
 *
 * @remarks
 * This controller acts as the main entry point for external systems to send events.
 * It orchestrates the entire notification process by performing the following steps:
 * 1.  Validates the incoming {@link WebhookPayload} for required fields.
 * 2.  Extracts a list of recipient employee numbers.
 * 3.  Iterates over each recipient to fetch their details from the User Management service.
 * 4.  For each valid user, it triggers two parallel notification actions:
 *     - An email notification via the `email.service`.
 *     - An in-app dashboard notification via the `notificationDb.service`.
 * 5.  Finally, it responds to the webhook caller with a summary of the operation (e.g., how many users were notified).
 *
 * @route POST /api/v1/event (or a similar path defined in `webhook.routes.ts`)
 * @param req - The Express request object, which is expected to contain the webhook payload in its body.
 * @param res - The Express response object, used to send the final status back to the webhook caller.
 * @returns A promise that resolves when the response has been sent. The HTTP response indicates the outcome of the notification processing.
 *
 * @example
 * Request Body:
 * ```json
 * {
 *   "eventType": "DOMAIN_APPROVED",
 *   "recipients": {
 *     "admin1": 1001,
 *     "manager2": 1005
 *   },
 *   "triggeredBy": {
 *     "emp_no": 9001,
 *     "role": "DRM"
 *   },
 *   "data": {
 *     "domainName": "example.com",
 *     "remarks": "Approved by management."
 *   },
 *   "timestamp": "2023-10-27T10:00:00Z"
 * }
 * ```
 */
export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const payload = req.body as WebhookPayload;

  console.log(`Webhook received: Event Type - ${payload.eventType}`);

  if (
    !payload.eventType ||
    !payload.recipients ||
    typeof payload.recipients !== "object"
  ) {
    console.warn("Webhook ignored: Invalid payload structure.");
    res.status(400).send("Bad Request: Invalid payload structure.");
    return;
  }

  const recipientEmpNos = Object.values(payload.recipients).filter((id) => {
    typeof id === "bigint";
    console.log(id);
    return id;
  });
  
  console.log(recipientEmpNos);
  const role = payload.triggeredBy.role;

  if (recipientEmpNos.length === 0) {
    console.log("Webhook processed: No numeric recipient emp_no found.");
    res.status(200).send("OK: No recipients specified.");
    return;
  }

  console.log(
    `Processing notifications for recipients: ${recipientEmpNos.join(", ")}`
  );

  let successCount = 0;

  try {
    for (const empNo of recipientEmpNos) {
      try {
        const userInfo: UserInfo | null = await findUserEmailByEmpNo(
          empNo
        );

        if (!userInfo || !userInfo.email) {
          console.warn(`Skipping user ${empNo}: Email not found.`);
          continue;
        }

        const emailHtml = createEmailContent(payload, userInfo);
        const subject = `Notification: ${payload.eventType}`;

        sendEmail({ to: emailHtml.to, subject, html: emailHtml.html });

        const message = `${
          payload.data.remarks || ""
        }`;
        createDbNotification(empNo, message.trim(), payload.eventType,payload.triggeredBy.emp_no);

        successCount++;
      } catch (error) {
        console.error(
          `Error processing notification for user ${empNo}:`,
          error
        );
      }
    }

    if (successCount > 0) {
      res
        .status(202)
        .send(`${successCount} user(s) notified via Email and Dashboard`);
    } else {
      res.status(206).send("No users were successfully notified."); // 206: Partial Content
    }
  } catch (error) {
    console.error("Unhandled error in webhook handler:", error);
    res.status(500).send("Internal Server Error");
  }
};
