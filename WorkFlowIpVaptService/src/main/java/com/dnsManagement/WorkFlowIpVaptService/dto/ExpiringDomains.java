package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpiringDomains {

  private Long domainId;
  private String domainName;
  private Long armEmpNo;
  private String armName;
  private String armMobile;
  private String armEmail;
  private LocalDate expiringDate;
}
