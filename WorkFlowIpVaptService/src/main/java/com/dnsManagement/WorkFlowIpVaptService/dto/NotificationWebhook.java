package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationWebhook {
    private EventType eventType;
    private LocalDateTime timestamp;
    private TriggeredBy triggeredBy;
    @JsonProperty("data")
    private NotificationData notificationData;
    private Recipients recipients;



    public enum EventType {
        // --- Domain Lifecycle Events ---
        DOMAIN_APPLICATION_SUBMITTED,
        DOMAIN_ARM_VERIFICATION_FORWARDED,
        DOMAIN_HOD_VERIFIED,
        DOMAIN_ED_APPROVED,
        DOMAIN_NETOPS_VERIFIED,
        DOMAIN_WEBMASTER_VERIFIED,
        DOMAIN_HPC_HOD_RECOMMENDED,
        DOMAIN_VERIFICATION_COMPLETED,
        DOMAIN_VERIFICATION_REJECTED,
        DOMAIN_PURCHASED,
        DOMAIN_RENEWAL_REQUESTED,
        DOMAIN_RENEWAL_APPROVED,
        DOMAIN_RENEWAL_COMPLETED,
        DOMAIN_EXPIRY_WARNING,
        DOMAIN_EXPIRED,
        DOMAIN_DELETED,
        DOMAIN_ACTIVATED,
        DOMAIN_DEACTIVATED,

        // --- Infrastructure Events (IP / VAPT / SSL) ---
        IP_ASSIGNED,
        IP_RENEWED,
        IP_EXPIRY_WARNING,
        VAPT_COMPLETED,
        VAPT_RENEWED,
        VAPT_EXPIRY_WARNING,

        // --- User / Assignment / Transfer Events ---
        PROJECT_ASSIGNED,
        DOMAIN_TRANSFER_STARTED,
        DOMAIN_TRANSFER_APPROVED,
        DOMAIN_TRANSFER_FINISHED,
        USER_ENABLED,
        USER_DISABLED,

        // --- Generic / System Events ---
        SYSTEM_ALERT,
        UNKNOWN_EVENT
    }
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TriggeredBy{
        @JsonProperty("emp_no")
        private Long empNo;
        private Role role;
    }
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NotificationData{
        private Long domainId;
        private String domainName;
        private String remarks;
    }
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Recipients{
        @JsonProperty("drm_emp_no")
        private Long drmEmpNo;
        @JsonProperty("arm_emp_no")
        private Long armEmpNo;
        @JsonProperty("hod_emp_no")
        private Long hodEmpNo;
        @JsonProperty("ed_emp_no")
        private Long edEmpNo;
        @JsonProperty("netops_emp_no")
        private Long netopsEmpNo;
        @JsonProperty("webmaster_emp_no")
        private Long webmasterEmpNo;
        @JsonProperty("hod_hpc_emp_no")
        private Long hodHpcEmpNo;
    }
}
