package com.dnsManagement.WorkFlowIpVaptService.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class DomainRenewal {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long renewalId;

  @ManyToOne
  @JsonIgnore
  @JoinColumn(name = "dm_id", nullable = false)
  private DomainName domainName;

  @Column(name = "prev_dm_name", nullable = false)
  private String previousDomainName;

  @Column(name = "reason", nullable = true)
  private String reason;

  @Column(name = "hod_appr_date", nullable = true)
  private LocalDateTime hodApprovalDate;

  @JsonIgnore
  @JoinColumn(name = "hod_emp_no", nullable = false)
  private Long hodEmployeeNumber;

  @Lob
  @NotNull
  @Column(name = "appr_prf_by_hod", nullable = false)
  private byte[] approvalProofByHod;

}
