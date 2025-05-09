package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DomainResponse {

  private Long domainNameId;

  private String domainName;

  private Long drmEmployeeNumber;

  private Long armEmployeeNumber;


  private Long hodEmployeeNumber;




  private boolean vaptCompliantStatus;

  private byte[] approvalProofVaptCompliantStatus;

  private Long edEmployeeNumber;

  private Long netopsEmployeeNumber;

  private Long webmasterEmployeeNumber;

  private Long hodHpcEmployeeNumber;


  private boolean isActive = false;

  private boolean isDeleted = false; // Is the domain deleted or not

  private boolean isRenewal = false;
}
