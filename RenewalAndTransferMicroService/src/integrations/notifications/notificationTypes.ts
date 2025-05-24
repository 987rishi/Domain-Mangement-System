/**
 * Represents various events in the domain lifecycle, infrastructure updates,
 * user activity, and system operations that may trigger a webhook notification.
 */
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
  DOMAIN_TRANSFER_APPROVED = "Domain transfer approved",
  DOMAIN_TRANSFER_FINISHED = "Domain transfer completed",
  USER_ENABLED = "User activated",
  USER_DISABLED = "User deactivated",

  // --- Generic / System Events ---
  SYSTEM_ALERT = "System alert",
  UNKNOWN_EVENT = "Unknown event",
}
