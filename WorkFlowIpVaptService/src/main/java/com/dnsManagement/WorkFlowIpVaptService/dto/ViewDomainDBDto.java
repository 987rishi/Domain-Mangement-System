package com.dnsManagement.WorkFlowIpVaptService.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViewDomainDBDto {

  private Long domainId;
  private String domainName;
  private Long drmEmpNo;
  private Timestamp domainExpiryDate;
  private boolean isActive;
  private boolean isRenewal;
  private boolean isDeleted;
}
