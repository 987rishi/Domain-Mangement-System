package com.dnsManagement.WorkFlowIpVaptService.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Purchases {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "purchase_id")
  private Long purchaseId;

  @ManyToOne
  @JsonIgnore
  @JoinColumn(name = "dm_id", nullable = false)
  private DomainName domainName;

  @JsonIgnore
  @NotNull
  @Column(name = "wbmstr_id", nullable = false)
  private Long webmasterId;

  @NotNull
  @Column(name = "dt_of_purchase", nullable = false)
  private LocalDateTime dateOfPurchase;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(name = "purchase_type", nullable = false)
  private PurchaseType purchaseType;

  @NotNull
  @Column(name = "prf_of_purchase", nullable = false)
  private byte[] proofOfPurchase;
}
