package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VerifyDomainRequestPageDto {

  private Long domainId;
  private String domainName;
  private String drmName;
  private String armName;
  private LocalDate dateOfApplication;

  private String drmCentreName;
  private String armCentreName;

  private String drmGroupName;
  private String armGroupName;


}
