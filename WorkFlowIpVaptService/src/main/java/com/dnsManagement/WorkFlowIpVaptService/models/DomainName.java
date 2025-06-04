package com.dnsManagement.WorkFlowIpVaptService.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DomainName {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "dm_id")
  private Long domainNameId;

  @Column(name = "dm_name", nullable = false, unique = true)
  private String domainName;

  @Column(name = "expiry_date", nullable = true)
  private LocalDateTime expiryDate;

  @Column(name = "last_notification_period_sent", nullable = true)
//  @Enumerated(EnumType.STRING
  private Integer lastNotificationDateSentForDays;

  @Column(name = "d_o_apl", nullable = true)
  private LocalDateTime dateOfApplication; // Date of Application

  @Column(name = "d_o_act", nullable = true)
  private LocalDateTime dateOfActivation; // Date of Activation

  @Column(name = "lst_rw_date", nullable = true)
  private LocalDateTime lastRenewalDate; // Last Renewal Date

  @Column(name = "drm_emp_no", nullable = false)
  private Long drmEmployeeNumber;

  @Column(name = "arm_emp_no", nullable = false)
  private Long armEmployeeNumber;

  @Column(name = "hod_emp_no", nullable = false)
  private Long hodEmployeeNumber;

  @Enumerated(EnumType.STRING)
  @Column(name = "service_type", nullable = false)
  @NotNull
  private ServiceType serviceType;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(name = "gigcw_comp", nullable = false)
  private Status gigcwCompletionStatus;

  @NotNull
  @Column(name = "vapt_comp", nullable = false)
  private boolean vaptCompletionStatus;

  @Column(name = "appr_prf_vapt_comp", nullable = false)
  @Lob
  private byte[] approvalProofVaptCompletionStatus;

  @Column(name = "mou_status", nullable = false)
  @Enumerated(EnumType.STRING)
  private Status mouStatus;

  @Column(name = "period", nullable = false)
  private Integer periodInYears; // In years

  @Column(name = "serv_hard_status", nullable = false)
  private boolean serverHardeningStatus;

  @Column(name = "ed_emp_no", nullable = false)
  private Long edEmployeeNumber;

  @Column(name = "netops_emp_no", nullable = false)
  private Long netopsEmployeeNumber;

  @Column(name = "webmaster_emp_no", nullable = false)
  private Long webmasterEmployeeNumber;

  @Column(name = "hod_hpc_emp_no", nullable = false)
  private Long hodHpcEmployeeNumber;

  @NotNull
  @Column(name = "is_active", nullable = false)
  private boolean isActive = false;

  @Column(name = "is_del", nullable = false)
  private boolean isDeleted = false; // Is the domain deleted or not

  @Column(name = "is_renewal", nullable = false)
  private boolean isRenewal = false;

  @Column(name = "dm_desc", nullable = true)
  private String domainDescription; // Description about the domain
}
