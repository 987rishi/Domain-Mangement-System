package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransferRequestDto {

  @JsonProperty("tt_id")
  private String ttId;

  @JsonProperty("dm_id")
  private String dmId;

  @JsonProperty("trns_frm")
  private String trnsFrom;

  @JsonProperty("trns_to")
  private String trnsTo;

  @JsonProperty("rsn_for_trns")
  private String reasonForTransfer;

  @JsonProperty("prf_upload")
  private String proofUpload;  // Base64 or hex-encoded string of the uploaded proof

  @JsonProperty("hod_empno")
  private String hodEmpNo;

  @JsonProperty("hod_approved")
  private Boolean hodApproved;

  @JsonProperty("created_at")
  private Instant createdAt;

  @JsonProperty("approved_at")
  private Instant approvedAt;

  @JsonProperty("updated_at")
  private Instant updatedAt;
}

