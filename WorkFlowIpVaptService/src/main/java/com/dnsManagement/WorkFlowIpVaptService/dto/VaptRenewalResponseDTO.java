package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VaptRenewalResponseDTO {

  @JsonProperty("vapt_rnwl_id")
  private String vaptRenewalId;

  @JsonProperty("dm_id")
  private String domainId;

  @JsonProperty("created_at")
  private Instant createdAt;

  @JsonProperty("rnwl_no")
  private String renewalNo;

  @JsonProperty("vapt_id")
  private String vaptId;

  @JsonProperty("old_vapt_report")
  private String oldVaptReport; // base64 encoded, nullable & optional

  @JsonProperty("new_vapt_report")
  private String newVaptReport; // base64 encoded, required

  @JsonProperty("new_vapt_expiry_date")
  private LocalDate newVaptExpiryDate; // nullable & optional

  @JsonProperty("drm_empno_initiator")
  private String drmEmpNoInitiator; // nullable & optional

  @JsonProperty("drm_remarks")
  private String drmRemarks;

  @JsonProperty("is_aprvd")
  private Boolean isApproved; // nullable & optional

  @JsonProperty("hod_empno_approver")
  private String hodEmpNoApprover; // nullable & optional

  @JsonProperty("aprvl_date")
  private LocalDate approvalDate; // nullable & optional

  @JsonProperty("hod_remarks")
  private String hodRemarks;

  @JsonProperty("status")
  private String status; // enum

  @JsonProperty("updated_at")
  private Instant updatedAt;
}

