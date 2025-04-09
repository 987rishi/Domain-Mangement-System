import { Request, Response } from "express";
import { WebhookPayload, UserInfo } from "../types/webhook.types";
import { sendEmail, createEmailContent  } from "../services/email.service";
import { createDbNotification } from "../services/notificationDb.service";
// Placeholder for fetching user email - replace with actual logic
import { findUserEmailByEmpNo } from "../services/user.service"; // Assume this exists

export const handleWebhook = async (req: Request, res: Response):Promise<void> => {
  const payload = req.body as WebhookPayload;

  console.log(`Webhook received: Event Type - ${payload.eventType}`);

  // Basic validation (add more robust validation using libraries like Zod)
  if (
    !payload.eventType ||
    !payload.recipients ||
    typeof payload.recipients !== "object"
  ) {
    console.warn("Webhook ignored: Invalid payload structure.");
     res.status(400).send("Bad Request: Invalid payload structure.");
    return;
  }

  const recipientEmpNos = Object.values(payload.recipients).filter(
    (id) => {
      typeof id === "bigint"
      console.log(id);
      return id;
    }
  );

  if (recipientEmpNos.length === 0) {
    console.log("Webhook processed: No numeric recipient emp_no found.");
     res.status(200).send("OK: No recipients specified."); // Acknowledge receipt
    return;
  }

  console.log(
    `Processing notifications for recipients: ${recipientEmpNos.join(", ")}`
  );

  // Process each recipient
  for (const empNo of recipientEmpNos) {
    try {
      // 1. Fetch recipient details (Email is essential)
      //    Replace this placeholder with a call to User Management Service or DB lookup
      const userInfo: UserInfo | null = await findUserEmailByEmpNo(
        empNo
      );

      if (!userInfo || !userInfo.email) {
        console.warn(`Skipping user ${empNo}: Email not found.`);
        continue; // Skip to the next recipient
      }

      // 2. Send Email
      const emailHtml = createEmailContent(payload, userInfo);
      const subject = `Notification: ${payload.eventType}`; // Customize subject
      sendEmail({ to: emailHtml.to, subject, html: emailHtml.html }); // Fire and forget email sending

      // 3. Create Dashboard Notification in DB
      const message = `Event: ${payload.eventType}. ${
        payload.data.remarks || ""
      }`; // Customize message

      createDbNotification(
        empNo,
        message.trim(),
        payload.eventType,
      ); // Fire and forget DB creation
    } catch (error) {
      console.error(`Error processing notification for user ${empNo}:`, error);
      // Continue processing other recipients even if one fails
    }
  }
  // Acknowledge webhook receipt successfully, even if individual notifications had issues
  res.status(202).send("user is notified through Email and notification.");
};
