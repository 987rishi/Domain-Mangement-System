package com.dnsManagement.WorkFlowIpVaptService.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@Data
@NoArgsConstructor
public class DomainVerification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "dm_vfy_id")
  private Long domainVerificationId; // DOMAIN VERIFICATION ID

  @OneToOne
  @JsonIgnore
  @JoinColumn(name = "dm_id", unique = true, nullable = false)
  private DomainName domainName; // Domain ID

  @Column(name = "fwd_arm", nullable = false)
  private boolean forwardedToArm = false; // Arm FORWARDED TO DRM OR NOT

  @Column(name = "fwd_date_arm", nullable = true)
  private LocalDateTime forwardedDateArm; // TIMESTAMP OF Arm FORWARDING

  @Column(name = "arm_remarks", nullable = true)
  private String armRemarks; // REMARKS GIVEN BY Arm

  @Column(name = "vfyd_by_hod", nullable = false)
  private boolean verifiedByHod = false; // HOD VERIFIED OR NOT

  @Column(name = "vfy_date_hod", nullable = true)
  private LocalDateTime verificationDateHod; // TIMESTAMP OF Hod VERIFICATION

  @Column(name = "snt_bk_by_hod", nullable = false)
  private boolean sentBackByHod = false; // IS THE DOMAIN REQUEST SENT BACK TO DRM

  @Column(name = "hod_remarks", nullable = true)
  private String hodRemarks; // REMARKS GIVEN BY Hod

  @Column(name = "vfy_by_ed", nullable = false)
  private boolean verifiedByEd = false; // ED VERIFIED OR NOT

  @Column(name = "vfy_date_ed", nullable = true)
  private LocalDateTime verificationDateEd; // TIMESTAMP OF ED VERIFICATION

  @Column(name = "snt_bk_by_ed", nullable = false)
  private boolean sentBackByEd = false; // IS THE DOMAIN REQUEST SENT BACK TO DRM

  @Column(name = "ed_remarks", nullable = true)
  private String edRemarks; // REMARKS GIVEN BY ED

  @Column(name = "vfy_by_netops", nullable = false)
  private boolean verifiedByNetops = false; // VERIFIED BY NETOPS OR NOT

  @Column(name = "vfy_date_netops", nullable = true)
  private LocalDateTime verificationDateNetops; // TIMESTAMP OF NETOPS VERIFICATION

  @Column(name = "snt_bk_by_netops", nullable = false)
  private boolean sentBackByNetops = false; // IS THE DOMAIN REQUEST SENT BACK TO DRM

  @Column(name = "netops_remarks", nullable = true)
  private String netopsRemarks; // REMARKS GIVEN BY NETOPS

  @Column(name = "vfy_by_wbmstr", nullable = false)
  private boolean verifiedByWebmaster = false; // VERIFIED BY WEBMASTER OR NOT

  @Column(name = "vfy_date_wbmstr", nullable = true)
  private LocalDateTime verificationDateWebmaster; // TIMESTAMP OF WEBMASTER VERIFICATION

  @Column(name = "snt_bk_by_wbmstr", nullable = false)
  private boolean sentBackByWebmaster = false; // IS THE DOMAIN REQUEST SENT BACK TO DRM

  @Column(name = "wbmstr_remarks", nullable = true)
  private String webmasterRemarks; // REMARKS GIVEN BY WEBMASTER

  @Column(name = "vfy_by_hod_hpc_iand_e", nullable = false)
  private boolean verifiedByHodHpcIandE = false; // VERIFIED BY HOD (HPC I&E) OR NOT

  @Column(name = "vfy_date_hod_hpc", nullable = true)
  private LocalDateTime verificationDateHodHpc; // TIMESTAMP OF HOD (HPC) VERIFICATION

  @Column(name = "snt_bk_by_hpc", nullable = false)
  private boolean sentBackByHpc = false; // IS THE DOMAIN REQUEST SENT BACK TO DRM

  @Column(name = "hpc_remarks", nullable = true)
  private String hpcRemarks; // REMARKS GIVEN BY HOD (HPC)

  @Column(name = "is_verified", nullable = false)
  private boolean isVerified = false;

}
