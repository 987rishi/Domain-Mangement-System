package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViewTransferDto {

  private Long domainId;
  private String domainName;
  private String drmName;
  private String armName;
  private Instant dateOfApplication;
  private Long transferId;
}
