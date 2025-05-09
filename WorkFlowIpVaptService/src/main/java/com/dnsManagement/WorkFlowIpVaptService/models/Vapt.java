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
public class Vapt {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "vapt_id")
  private Long vaptId;

  @OneToOne
  @JoinColumn(name = "ip_id", nullable = false, unique = true)
  private Ip ip;

  @Column(name = "exp_date", nullable = true)
  private LocalDateTime expiryDate;

  @NotNull
  @Column(name = "vapt_certify_auth", nullable = false)
  private String vaptCertifyAuthority;

  @Lob
  @NotNull
  @Column(name = "prf_work", nullable = false)
  private byte[] proofOfWork;

  @Column(name = "vapt_remarks", nullable = true)
  private String vaptRemarks;

  @Column(name = "is_active", nullable = false)
  private boolean isActive = false;
}
