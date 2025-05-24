package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.dnsManagement.WorkFlowIpVaptService.models.PurchaseType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DomainPurchase {

  @NotNull
  private LocalDateTime domainExpiryDate;

  @NotNull
  private Integer finalPeriod;


  @NotNull
  private Long domainId;

  @NotNull
  private Long webMasterId;

  @NotNull
  private LocalDateTime dateOfPurchase;

  @NotNull
  private PurchaseType purchaseType;

  @NotNull
  private String proofOfWorkBase64Encoded;

}
