package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.dnsManagement.WorkFlowIpVaptService.models.ServiceType;
import com.dnsManagement.WorkFlowIpVaptService.models.Status;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DomainNameRequest {

  @NotNull private PersonInfo drmInfo;
  @NotNull private PersonInfo armInfo;
  @NotNull private DomainDetails domainDetails;
  @NotNull private ApproverInfo approverInfo;
  @NotNull private IpDetails ipDetails;
  @NotNull private VaptCompliance vaptCompliance;
  @NotNull private ComplianceStatus complianceStatus;

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class PersonInfo {
    @NotNull private String fname;
    @NotNull private String lname;
    @NotNull private Integer groupId;
    @NotNull private Integer centreId;
    @NotNull private Designation designation;
    @NotNull @Email private String email;
    @NotNull private String teleNumber;
    @NotNull private String mobileNumber;
    @NotNull private Long empNo;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class DomainDetails {
    @NotNull private String domainName;
    @NotNull private String description;
    @NotNull private ServiceType serviceType;
    @NotNull private Integer periodInYears;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class ApproverInfo {
    @JsonProperty("hod_emp_no")
     private Long hodEmpNo;
    @JsonProperty("ed_emp_no")
     private Long edEmpNo;
    @JsonProperty("netops_emp_no")
     private Long netopsEmpNo;
    @JsonProperty("webmaster_emp_no")
     private Long webmasterEmpNo;
    @JsonProperty("hod_hpc_iande_emp_no")
     private Long hodHpcEmpNo;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class IpDetails {
    @NotNull private String publicIpAddress;
    @NotNull private String ipIssuer;
    @NotNull private boolean serverHardeningStatus;
//   Not there in form not sure whether to keep
    private LocalDateTime ipExpiryDate;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class VaptCompliance {
    @NotNull private boolean compliant;
    @NotNull private String certifyingAuthority;
    @NotNull private LocalDateTime certificateExpiryDate;
    @NotNull private byte[] approvalProof;
    private String remarks;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class ComplianceStatus {
    @Enumerated(EnumType.STRING)
    @NotNull private Status gigwCompliance;
    @Enumerated(EnumType.STRING)
    @NotNull private Status mouStatus;
  }
}
