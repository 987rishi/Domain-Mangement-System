package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViewDomainResponseDto {
  private Long domainId;
  private String domainName;
  private String drmName;
  private String drmGroupName;
  private String drmCentreName;
  private LocalDate domainExpiryDate;
  private String status;
}
