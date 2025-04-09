package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.dnsManagement.WorkFlowIpVaptService.models.ServiceType;
import com.dnsManagement.WorkFlowIpVaptService.models.Status;
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

    //
    @NotNull
    private Long domainId;

    @NotNull
    private String reason;

    @NotNull
    private byte[] domainRenewalApprovalProofByHod;

    //
    @NotNull
    private String drmFname;

    @NotNull
    private String drmLname;

    @NotNull
    private String armFname;

    @NotNull
    private String armLname;

    @NotNull
    private Integer drmGroupId;

    @NotNull
    private Integer armGroupId;


    @NotNull
    private String drmDesignation;

    @NotNull
    private String armDesignation;

    @NotNull
    private Integer drmCentreId;

    @NotNull
    private Integer armCentreId;

    @NotNull
    @Email
    private String drmEmail;

    @NotNull
    @Email
    private String armEmail;

    @NotNull
    private String drmTeleNumber;

    @NotNull
    private String drmMobileNumber;

    @NotNull
    private String armTeleNumber;

    @NotNull
    private String armMobileNumber;



    @NotNull
    private String dm_name;

    @NotNull
    private ServiceType service_type;

    @NotNull
    private Integer period;//IN YRS

    @NotNull
    private Long drm_emp_no;

    @NotNull
    private Long arm_emp_no;

    @NotNull
    private Long hod_emp_no;

    @NotNull
    private Long ed_emp_no;

    @NotNull
    private Long netops_emp_no;

    @NotNull
    private Long webmaster_emp_no;

    @NotNull
    private Long hod_hpc_emp_no;



    @NotNull
    private String dm_desc;//DESCRIPTION ABOUT THE DOMAIN





    @NotNull
    private String publicIpAddress;

    @NotNull
    private String ipIssuer;

    @NotNull
    private boolean serverHardeningStatus;


    @NotNull
    private boolean vaptCompliant; // true for Yes, false for No

    @NotNull
    private String vaptCertifyingAuthority;

    @NotNull
    private LocalDate vaptCertificateExpiryDate;

    @NotNull
    private byte[] approvalProofVaptCompliant;

    private String vaptRemarks;



    @NotNull
    private Status gigwCompliance; // "Yes", "No", or "NA"

    @NotNull
    private Status mouStatus;

}
