package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VaptRenewalDetailDto {

  private String vaptRenewalId;

  private Instant createdAt;

  private String domainName;

  private String oldVaptReport; // base64 encoded, nullable & optional

  private String newVaptReport; // base64 encoded, required

  private LocalDate newVaptExpiryDate; // nullable & optional

  private String drmName;

  private String drmEmail;

  private String drmMobileNo;

  private String drmCentre;

  private String armName;

  private String armEmail;

  private String armMobileNo;

  private String armCentre;

  private String status;
}
