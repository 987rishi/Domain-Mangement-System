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
exports.handleWebhook = void 0;
const email_service_1 = require("../services/email.service");
const notificationDb_service_1 = require("../services/notificationDb.service");
// Placeholder for fetching user email - replace with actual logic
const user_service_1 = require("../services/user.service"); // Assume this exists
// export const handleWebhook = async (req: Request, res: Response):Promise<void> => {
//   const payload = req.body as WebhookPayload;
//   console.log(`Webhook received: Event Type - ${payload.eventType}`);
//   // Basic validation (add more robust validation using libraries like Zod)
//   if (
//     !payload.eventType ||
//     !payload.recipients ||
//     typeof payload.recipients !== "object"
//   ) {
//     console.warn("Webhook ignored: Invalid payload structure.");
//      res.status(400).send("Bad Request: Invalid payload structure.");
//     return;
//   }
//   const recipientEmpNos = Object.values(payload.recipients).filter(
//     (id) => {
//       typeof id === "bigint"
//       console.log(id);
//       return id;
//     }
//   );
//   const role = payload.triggeredBy.role;
//   if (recipientEmpNos.length === 0) {
//     console.log("Webhook processed: No numeric recipient emp_no found.");
//      res.status(200).send("OK: No recipients specified."); // Acknowledge receipt
//     return;
//   }
//   console.log(
//     `Processing notifications for recipients: ${recipientEmpNos.join(", ")}`
//   );
//   // Process each recipient
//  try {
//    for (const empNo of recipientEmpNos) {
//      try {
//        // 1. Fetch recipient details (Email is essential)
//        //    Replace this placeholder with a call to User Management Service or DB lookup
//        const userInfo: UserInfo | null = await findUserEmailByEmpNo(
//          empNo,
//          role
//        );
//        if (!userInfo || !userInfo.email) {
//          console.warn(`Skipping user ${empNo}: Email not found.`);
//          continue; // Skip to the next recipient
//        }
//        // 2. Send Email
//        const emailHtml = createEmailContent(payload, userInfo);
//        const subject = `Notification: ${payload.eventType}`; // Customize subject
//        sendEmail({ to: emailHtml.to, subject, html: emailHtml.html }); // Fire and forget email sending
//        // 3. Create Dashboard Notification in DB
//        const message = `Event: ${payload.eventType}. ${
//          payload.data.remarks || ""
//        }`; // Customize message
//        createDbNotification(empNo, message.trim(), payload.eventType); // Fire and forget DB creation
//        // Acknowledge webhook receipt successfully, even if individual notifications had issues
//        res.status(202).send("user is notified through Email and notification.");
//        return;
//      } catch (error) {
//        console.error(`Error processing notification for user ${empNo}:`, error);
//        // Continue processing other recipients even if one fails
//      }
//    }
//    return;
//  } catch (error) {
//   console.log(error);
//   res.status(500).send("Internal Server Error");
//   return;
//  } 
// };
const handleWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    console.log(`Webhook received: Event Type - ${payload.eventType}`);
    if (!payload.eventType ||
        !payload.recipients ||
        typeof payload.recipients !== "object") {
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
    console.log(`Processing notifications for recipients: ${recipientEmpNos.join(", ")}`);
    let successCount = 0;
    try {
        for (const empNo of recipientEmpNos) {
            try {
                const userInfo = yield (0, user_service_1.findUserEmailByEmpNo)(empNo);
                if (!userInfo || !userInfo.email) {
                    console.warn(`Skipping user ${empNo}: Email not found.`);
                    continue;
                }
                const emailHtml = (0, email_service_1.createEmailContent)(payload, userInfo);
                const subject = `Notification: ${payload.eventType}`;
                (0, email_service_1.sendEmail)({ to: emailHtml.to, subject, html: emailHtml.html });
                const message = `Event: ${payload.eventType}. ${payload.data.remarks || ""}`;
                (0, notificationDb_service_1.createDbNotification)(empNo, message.trim(), payload.eventType);
                successCount++;
            }
            catch (error) {
                console.error(`Error processing notification for user ${empNo}:`, error);
            }
        }
        if (successCount > 0) {
            res
                .status(202)
                .send(`${successCount} user(s) notified via Email and Dashboard`);
        }
        else {
            res.status(206).send("No users were successfully notified."); // 206: Partial Content
        }
    }
    catch (error) {
        console.error("Unhandled error in webhook handler:", error);
        res.status(500).send("Internal Server Error");
    }
});
exports.handleWebhook = handleWebhook;
