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
public class DomainName {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dm_id;

    @Column(name = "dm_name", nullable = false, unique = true)
    private String dm_name;

    @Column(nullable = true)
    private LocalDateTime expiry_date;

    @Column(nullable = true)
    private LocalDateTime d_o_apl; // Date of Application

    @Column(nullable = true)
    private LocalDateTime d_o_act; // Date of Activation

    @Column(nullable = true)
    private LocalDateTime lst_rw_date; // Last Renewal Date

    // Instead of ManyToOne associations, store only the stakeholder IDs:
    @Column(name = "drm_emp_no", nullable = false)
    private Long drm_emp_no;

    @Column(name = "arm_emp_no", nullable = false)
    private Long arm_emp_no;

    @Column(name = "hod_emp_no", nullable = false)
    private Long hod_emp_no;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private ServiceType service_type;

    @NotNull
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status gigcw_comp;

    @NotNull
    @Column(nullable = false)
    private boolean vapt_comp;

    @Column(nullable = false)
    @Lob
    private byte[] appr_prf_vapt_comp;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status mou_status;

    @Column(nullable = false)
    private Integer period; // In years

    @Column(nullable = false)
    private boolean serv_hard_status;

    @Column(name = "ed_emp_no", nullable = false)
    private Long ed_emp_no;

    @Column(name = "netops_emp_no", nullable = false)
    private Long netops_emp_no;

    @Column(name = "webmaster_emp_no", nullable = false)
    private Long webmaster_emp_no;

    @Column(name = "hod_hpc_emp_no", nullable = false)
    private Long hod_hpc_emp_no;

    @NotNull
    @Column(nullable = false)
    private boolean is_active = false;

    @Column(nullable = false)
    private boolean is_del = false; // Is the domain deleted or not

    @Column(name = "is_renewal", nullable = false)
    private boolean is_renewal = false;

    @Column(nullable = true)
    private String dm_desc; // Description about the domain
}
