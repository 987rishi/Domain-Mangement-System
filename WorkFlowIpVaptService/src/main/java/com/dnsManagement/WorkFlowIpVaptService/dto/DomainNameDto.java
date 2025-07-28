package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DomainNameDto {
  private Long domainId;
  private String domainName;
  private Long drmEmpNo;
  private Long armEmpNo;
  private Timestamp dateOfApplication;

}
