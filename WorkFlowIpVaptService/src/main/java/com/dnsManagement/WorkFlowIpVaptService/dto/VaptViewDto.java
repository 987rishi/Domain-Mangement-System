package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VaptViewDto {

  private Long vaptId;
  private Long domainId;
  private String domainName;
  private String drmName;
  private String armName;
  private Long vaptRenewalId;
  private LocalDate vaptExpiryDate;

}
