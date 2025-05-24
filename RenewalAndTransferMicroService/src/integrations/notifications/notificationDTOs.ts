import { z } from "zod";

// Your existing Enum (ensure it's accessible in this scope)
export enum WebhookEventType {
  // --- Domain Lifecycle Events ---
  DOMAIN_APPLICATION_SUBMITTED = "Domain application submitted",
  DOMAIN_ARM_VERIFICATION_FORWARDED = "Domain verification forwarded by ARM",
  DOMAIN_HOD_VERIFIED = "Domain verified by HoD",
  DOMAIN_ED_APPROVED = "Domain approved by Executive Director",
  DOMAIN_NETOPS_VERIFIED = "Domain verified by NetOps",
  DOMAIN_WEBMASTER_VERIFIED = "Domain verified by Webmaster",
  DOMAIN_HPC_HOD_RECOMMENDED = "Domain recommended by HPC HoD",
  DOMAIN_VERIFICATION_COMPLETED = "Domain verification completed",
  DOMAIN_VERIFICATION_REJECTED = "Domain verification rejected",
  DOMAIN_PURCHASED = "Domain purchase completed",
  DOMAIN_RENEWAL_REQUESTED = "Domain renewal requested",
  DOMAIN_RENEWAL_APPROVED = "Domain renewal approved",
  DOMAIN_RENEWAL_COMPLETED = "Domain renewal completed",
  DOMAIN_EXPIRY_WARNING = "Domain expiry warning",
  DOMAIN_EXPIRED = "Domain expired",
  DOMAIN_DELETED = "Domain deleted",
  DOMAIN_ACTIVATED = "Domain activated",
  DOMAIN_DEACTIVATED = "Domain deactivated",

  // --- Infrastructure Events (IP / VAPT / SSL) ---
  IP_ASSIGNED = "IP assigned",
  IP_RENEWED = "IP renewed",
  IP_EXPIRY_WARNING = "IP expiry warning",
  VAPT_COMPLETED = "VAPT completed",
  VAPT_RENEWED = "VAPT renewed",
  VAPT_EXPIRY_WARNING = "VAPT expiry warning",
  // SSL_CERT_ISSUED = "SSL certificate issued",
  // SSL_CERT_RENEWED = "SSL certificate renewed",
  // SSL_CERT_EXPIRY_WARNING = "SSL certificate expiry warning",

  // --- User / Assignment / Transfer Events ---
  PROJECT_ASSIGNED = "Project assigned",
  DOMAIN_TRANSFER_STARTED = "Domain transfer initiated",
  DOMAIN_TRANSFER_APPROVED = "Domain transfer approved", // Example matched this, but using the string value
  DOMAIN_TRANSFER_FINISHED = "Domain transfer completed",
  USER_ENABLED = "User activated",
  USER_DISABLED = "User deactivated",

  // --- Generic / System Events ---
  SYSTEM_ALERT = "System alert",
  UNKNOWN_EVENT = "Unknown event",
}

export const NotificationTriggeredBySchema = z.object(
  {
    emp_no: z.coerce.bigint({
      message: "triggeredBy.emp_no must be an integer",
    }),
    role: z.string().min(1, { message: "triggeredBy.role cannot be empty" }), // Assuming role shouldn't be empty
  },
  {
    required_error: "triggeredBy object is required",
    invalid_type_error: "triggeredBy must be an object",
  }
);

export type NotificationTriggeredByDto = z.infer<
  typeof NotificationTriggeredBySchema
>;

export const NotificationDataSchema = z.object(
  {
    domainId: z.coerce.bigint({ message: "data.domainId must be an integer" }),
    domainName: z
      .string()
      .min(1, { message: "data.domainName cannot be empty" }),
    remarks: z.string(), // Remarks can potentially be empty, adjust if needed (e.g., .min(1) or .optional())
  },
  {
    required_error: "data object is required",
    invalid_type_error: "data must be an object",
  }
);
export type NotificationDataDto = z.infer<typeof NotificationDataSchema>;

export const NotificationRecipientsSchema = z.object(
  {
    drm_emp_no: z.coerce
      .bigint({
        message: "recipients.drm_emp_no must be an integer",
      })
      .optional(),
    arm_emp_no: z.coerce
      .bigint({
        message: "recipients.arm_emp_no must be an integer",
      })
      .optional(),
    hod_emp_no: z.coerce.bigint().optional(),
    ed_emp_no: z.coerce.bigint().optional(),
    netops_emp_no: z.coerce.bigint().optional(),
    webmaster_emp_no: z.coerce.bigint().optional(),
    hodhpc_emp_no: z.coerce.bigint().optional(),
  },
  {
    required_error: "recipients object is required",
    invalid_type_error: "recipients must be an object",
  }
);
export type NotificationRecipientsDto = z.infer<
  typeof NotificationRecipientsSchema
>;

// Zod schema for the webhook payload
export const NotificationPayloadSchema = z.object({
  eventType: z.string().min(1),

  // Validate timestamp as an ISO 8601 datetime string
  timestamp: z
    .string()
    .datetime({ message: "Invalid timestamp format (ISO 8601 expected)" })
    .default(new Date().toISOString()),

  // Validate the 'triggeredBy' object
  triggeredBy: NotificationTriggeredBySchema,

  // Validate the 'data' object
  data: NotificationDataSchema,

  // Validate the 'recipients' object
  recipients: NotificationRecipientsSchema,
});

export type NotificationPayloadDto = z.infer<typeof NotificationPayloadSchema>;
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
