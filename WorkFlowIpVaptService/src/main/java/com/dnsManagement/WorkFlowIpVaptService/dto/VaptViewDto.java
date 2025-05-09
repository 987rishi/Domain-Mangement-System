package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VaptViewDto {

  private Long vaptId;
//  private Long ipId;
  private Long domainId;
  private String domainName;
  private String drmName;
  private String armName;
  private Long vaptRenewalId;
  private LocalDate vaptExpiryDate;

//  @JsonProperty("dm_id")
//  private String domainId; // DRM employee ID (as stringified BigInt)
//  vapt_id: string; // Reference to original VAPT record (as stringified BigInt)
//  new_vapt_report: string; // Base64-encoded file content
//  new_vapt_expiry_date: string; // ISO string for expiry date
//  drm_remarks: string; // Remarks from DRM
}
