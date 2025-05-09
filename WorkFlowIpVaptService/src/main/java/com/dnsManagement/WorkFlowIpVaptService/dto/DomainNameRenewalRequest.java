package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.dnsManagement.WorkFlowIpVaptService.models.ServiceType;
import com.dnsManagement.WorkFlowIpVaptService.models.Status;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DomainNameRenewalRequest {

  @NotNull @JsonProperty("domainId") private Long domainId;
  @NotNull @JsonProperty("reason") private String reason;
  @NotNull @JsonProperty("domainRenewalApprovalProofByHod") private byte[] domainRenewalApprovalProofByHod;
  @NotNull @JsonProperty("drmInfo") private PersonInfo drmInfo;
  @NotNull @JsonProperty("armInfo") private PersonInfo armInfo;
  @NotNull @JsonProperty("domainDetails") private DomainDetails domainDetails;
  @NotNull @JsonProperty("approverInfo") private ApproverInfo approverInfo;
  @NotNull @JsonProperty("ipDetails") private IpDetails ipDetails;
  @NotNull @JsonProperty("vaptCompliance") private VaptCompliance vaptCompliance;
  @NotNull @JsonProperty("complianceStatus") private ComplianceStatus complianceStatus;
  private String status;

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class PersonInfo {
    @NotNull private String firstName;
    @NotNull private String lastName;
    @NotNull private Integer groupId;
    @NotNull private Integer centreId;
    @NotNull private Designation designation;
    @NotNull @Email private String email;
    @NotNull private String teleNumber;
    @NotNull private String mobileNumber;
    @NotNull private Long empNo;
    private String groupName;
    private String centreName;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class DomainDetails {
    @NotNull @JsonProperty("domainName") private String domainName;
    @NotNull @JsonProperty("description") private String description;
    @NotNull @JsonProperty("serviceType") private ServiceType serviceType;
    @NotNull @JsonProperty("periodInYears") private Integer periodInYears;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class ApproverInfo {
    @NotNull @JsonProperty("hodEmpNo") private Long hodEmpNo;
    @NotNull @JsonProperty("edEmpNo") private Long edEmpNo;
    @NotNull @JsonProperty("netopsEmpNo") private Long netopsEmpNo;
    @NotNull @JsonProperty("webmasterEmpNo") private Long webmasterEmpNo;
    @NotNull @JsonProperty("hodHpcEmpNo") private Long hodHpcEmpNo;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class IpDetails {
    @NotNull @JsonProperty("publicIpAddress") private String publicIpAddress;
    @NotNull @JsonProperty("ipIssuer") private String ipIssuer;
    @NotNull @JsonProperty("serverHardeningStatus") private boolean serverHardeningStatus;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class VaptCompliance {
    @NotNull @JsonProperty("vaptCompliant") private boolean vaptCompliant;
    @NotNull @JsonProperty("vaptCertifyingAuthority") private String certifyingAuthority;
    @NotNull @JsonProperty("vaptCertificateExpiryDate") private LocalDate certificateExpiryDate;
    @NotNull @JsonProperty("approvalProofVaptCompliant") private byte[] approvalProof;
    @JsonProperty("vaptRemarks") private String remarks;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class ComplianceStatus {
    @NotNull @JsonProperty("gigwCompliance") private Status gigwCompliance;
    @NotNull @JsonProperty("mouStatus") private Status mouStatus;
  }
}
