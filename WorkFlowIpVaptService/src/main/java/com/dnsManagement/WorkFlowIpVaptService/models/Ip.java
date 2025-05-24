package com.dnsManagement.WorkFlowIpVaptService.models;

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
public class Ip {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "ip_id")
  private Long ipId;

  @Column(name = "ip_address", nullable = false, unique = true)
  private String ipAddress;

  @NotNull
  @Column(name = "ip_issuer", nullable = false)
  private String ipIssuer;

  @Column(name = "expiry_date", nullable = true)
  private LocalDateTime expiryDate;

  @OneToOne
  @JoinColumn(name = "dm_id", nullable = false)
  private DomainName domainName;

  @Column(name = "is_active", nullable = false)
  private boolean isActive = false;

}
