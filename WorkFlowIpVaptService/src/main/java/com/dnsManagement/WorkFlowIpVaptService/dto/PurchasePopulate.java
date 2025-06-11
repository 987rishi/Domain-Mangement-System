package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class PurchasePopulate {

  private boolean isRenewal;

  private Integer desiredPeriod;

  public PurchasePopulate(boolean isRenewal, Integer desiredPeriod) {
    this.isRenewal = isRenewal;
    this.desiredPeriod = desiredPeriod;
  }
}
