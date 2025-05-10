"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPayloadSchema = exports.NotificationRecipientsSchema = exports.NotificationDataSchema = exports.NotificationTriggeredBySchema = exports.WebhookEventType = void 0;
const zod_1 = require("zod");
// Your existing Enum (ensure it's accessible in this scope)
var WebhookEventType;
(function (WebhookEventType) {
    // --- Domain Lifecycle Events ---
    WebhookEventType["DOMAIN_APPLICATION_SUBMITTED"] = "Domain application submitted";
    WebhookEventType["DOMAIN_ARM_VERIFICATION_FORWARDED"] = "Domain verification forwarded by ARM";
    WebhookEventType["DOMAIN_HOD_VERIFIED"] = "Domain verified by HoD";
    WebhookEventType["DOMAIN_ED_APPROVED"] = "Domain approved by Executive Director";
    WebhookEventType["DOMAIN_NETOPS_VERIFIED"] = "Domain verified by NetOps";
    WebhookEventType["DOMAIN_WEBMASTER_VERIFIED"] = "Domain verified by Webmaster";
    WebhookEventType["DOMAIN_HPC_HOD_RECOMMENDED"] = "Domain recommended by HPC HoD";
    WebhookEventType["DOMAIN_VERIFICATION_COMPLETED"] = "Domain verification completed";
    WebhookEventType["DOMAIN_VERIFICATION_REJECTED"] = "Domain verification rejected";
    WebhookEventType["DOMAIN_PURCHASED"] = "Domain purchase completed";
    WebhookEventType["DOMAIN_RENEWAL_REQUESTED"] = "Domain renewal requested";
    WebhookEventType["DOMAIN_RENEWAL_APPROVED"] = "Domain renewal approved";
    WebhookEventType["DOMAIN_RENEWAL_COMPLETED"] = "Domain renewal completed";
    WebhookEventType["DOMAIN_EXPIRY_WARNING"] = "Domain expiry warning";
    WebhookEventType["DOMAIN_EXPIRED"] = "Domain expired";
    WebhookEventType["DOMAIN_DELETED"] = "Domain deleted";
    WebhookEventType["DOMAIN_ACTIVATED"] = "Domain activated";
    WebhookEventType["DOMAIN_DEACTIVATED"] = "Domain deactivated";
    // --- Infrastructure Events (IP / VAPT / SSL) ---
    WebhookEventType["IP_ASSIGNED"] = "IP assigned";
    WebhookEventType["IP_RENEWED"] = "IP renewed";
    WebhookEventType["IP_EXPIRY_WARNING"] = "IP expiry warning";
    WebhookEventType["VAPT_COMPLETED"] = "VAPT completed";
    WebhookEventType["VAPT_RENEWED"] = "VAPT renewed";
    WebhookEventType["VAPT_EXPIRY_WARNING"] = "VAPT expiry warning";
    // SSL_CERT_ISSUED = "SSL certificate issued",
    // SSL_CERT_RENEWED = "SSL certificate renewed",
    // SSL_CERT_EXPIRY_WARNING = "SSL certificate expiry warning",
    // --- User / Assignment / Transfer Events ---
    WebhookEventType["PROJECT_ASSIGNED"] = "Project assigned";
    WebhookEventType["DOMAIN_TRANSFER_STARTED"] = "Domain transfer initiated";
    WebhookEventType["DOMAIN_TRANSFER_APPROVED"] = "Domain transfer approved";
    WebhookEventType["DOMAIN_TRANSFER_FINISHED"] = "Domain transfer completed";
    WebhookEventType["USER_ENABLED"] = "User activated";
    WebhookEventType["USER_DISABLED"] = "User deactivated";
    // --- Generic / System Events ---
    WebhookEventType["SYSTEM_ALERT"] = "System alert";
    WebhookEventType["UNKNOWN_EVENT"] = "Unknown event";
})(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
exports.NotificationTriggeredBySchema = zod_1.z.object({
    emp_no: zod_1.z.coerce.bigint({
        message: "triggeredBy.emp_no must be an integer",
    }),
    role: zod_1.z.string().min(1, { message: "triggeredBy.role cannot be empty" }), // Assuming role shouldn't be empty
}, {
    required_error: "triggeredBy object is required",
    invalid_type_error: "triggeredBy must be an object",
});
exports.NotificationDataSchema = zod_1.z.object({
    domainId: zod_1.z.coerce.bigint({ message: "data.domainId must be an integer" }),
    domainName: zod_1.z
        .string()
        .min(1, { message: "data.domainName cannot be empty" }),
    remarks: zod_1.z.string(), // Remarks can potentially be empty, adjust if needed (e.g., .min(1) or .optional())
}, {
    required_error: "data object is required",
    invalid_type_error: "data must be an object",
});
exports.NotificationRecipientsSchema = zod_1.z.object({
    drm_emp_no: zod_1.z.coerce
        .bigint({
        message: "recipients.drm_emp_no must be an integer",
    })
        .optional(),
    arm_emp_no: zod_1.z.coerce
        .bigint({
        message: "recipients.arm_emp_no must be an integer",
    })
        .optional(),
    hod_emp_no: zod_1.z.coerce.bigint().optional(),
    ed_emp_no: zod_1.z.coerce.bigint().optional(),
    netops_emp_no: zod_1.z.coerce.bigint().optional(),
    webmaster_emp_no: zod_1.z.coerce.bigint().optional(),
    hodhpc_emp_no: zod_1.z.coerce.bigint().optional(),
}, {
    required_error: "recipients object is required",
    invalid_type_error: "recipients must be an object",
});
// Zod schema for the webhook payload
exports.NotificationPayloadSchema = zod_1.z.object({
    eventType: zod_1.z.string().min(1),
    // Validate timestamp as an ISO 8601 datetime string
    timestamp: zod_1.z
        .string()
        .datetime({ message: "Invalid timestamp format (ISO 8601 expected)" })
        .default(new Date().toISOString()),
    // Validate the 'triggeredBy' object
    triggeredBy: exports.NotificationTriggeredBySchema,
    // Validate the 'data' object
    data: exports.NotificationDataSchema,
    // Validate the 'recipients' object
    recipients: exports.NotificationRecipientsSchema,
});
/*
// Example Usage:
const rawWebhookData = {
  "eventType": "Domain transfer approved", // Use the actual string value from the enum
  "timestamp": "2023-10-28T12:00:00Z",
  "triggeredBy": {
    "emp_no": 789,
    "role": "HOD"
  },
  "data": {
    "domainId": 987,
    "domainName": "test-domain-from-webhook.in",
    "remarks": "Approved by HoD during testing again."
  },
  "recipients": {
    "drm_emp_no": 123,
    "arm_emp_no": 456
  }
};

try {
  const validatedPayload = WebhookPayloadSchema.parse(rawWebhookData);
  console.log("Webhook payload is valid:", validatedPayload);
  // Type safety: validatedPayload is now of type WebhookPayloadDto
  console.log("Event Type:", validatedPayload.eventType);
  console.log("Triggered by Emp No:", validatedPayload.triggeredBy.emp_no);

} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Webhook validation failed:", error.format());
  } else {
    console.error("An unexpected error occurred:", error);
  }
}

// Example of invalid data
const invalidWebhookData = {
  "eventType": "SOMETHING_ELSE_ENTIRELY", // Invalid enum value
  "timestamp": "2023/10/28", // Invalid format
  "triggeredBy": {
    "emp_no": "abc", // Invalid type
    "role": "HOD"
  },
  // missing 'data' and 'recipients'
};

const result = WebhookPayloadSchema.safeParse(invalidWebhookData);
if (!result.success) {
  console.error("\nWebhook validation failed (safeParse):", result.error.format());
}
*/
// {
//     "eventType": "APPROVED",
//     "timestamp": "2023-10-28T12:00:00Z",
//     "triggeredBy": {
//       "emp_no": 789,
//       "role": "HOD"
//     },
//     "data": {
//       "domainId": 987,
//       "domainName": "test-domain-from-webhook.in",
//       "remarks": "Approved by HoD during testing again."
//     },
//     "recipients": {
//       "drm_emp_no": 123,
//       "arm_emp_no": 456
//     }
// }
