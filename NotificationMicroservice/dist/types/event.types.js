"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEventType = void 0;
/**
 * Represents various events in the domain lifecycle, infrastructure updates,
 * user activity, and system operations that may trigger a webhook notification.
 */
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
