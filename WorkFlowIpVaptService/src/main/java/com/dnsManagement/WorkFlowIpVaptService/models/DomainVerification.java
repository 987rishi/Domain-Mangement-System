package com.dnsManagement.WorkFlowIpVaptService.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    private Long dm_vfy_id; //DOMAIN VERIFICATION ID

    @OneToOne
    @JsonIgnore
    @JoinColumn(name = "dm_id",unique = true,nullable = false)
    private DomainName dm_id;//Domain ID


    @Column(nullable = false)
    private boolean fwd_arm=false; //Arm FORWARDED TO DRM OR NOT


    @Column(nullable = true)
    private LocalDateTime fwd_date_arm; //TIMESTAMP OF Arm FORWARDING

    @Column(nullable = true)
    private String arm_remarks; //REMARKS GIVEN BY Arm


    @Column(nullable = false)
    private boolean vfyd_by_hod=false; //HOD VERIFIED OR NOT

    @Column(nullable = true)
    private LocalDateTime vfy_date_hod; //TIMESTAMP OF Hod VERIFICATION

    @Column(nullable = false)
    private boolean snt_bk_by_hod=false;//IS THE DOMAIN REQUEST SENT BACK TO DRM


    private String hod_remarks; //REMARKS GIVEN BY Hod

    @Column(nullable = false)
    private boolean vfy_by_ed=false; //ED VERIFIED OR NOT

    @Column(nullable = true)
    private LocalDateTime vfy_date_ed; //TIMESTAMP OF ED VERIFICATION

    @Column(nullable = false)
    private boolean snt_bk_by_ed=false;//IS THE DOMAIN REQUEST SENT BACK TO DRM

    private String ed_remarks; //REMARKS GIVEN BY ED


    @Column(nullable = false)
    private boolean vfy_by_netops=false; //ED VERIFIED OR NOT

    @Column(nullable = true)
    private LocalDateTime vfy_date_netops; //TIMESTAMP OF ED VERIFICATION

    @Column(nullable = false)
    private boolean snt_bk_by_netops=false;//IS THE DOMAIN REQUEST SENT BACK TO DRM


    private String netops_remarks; //REMARKS GIVEN BY ED

    @Column(nullable = false)
    private boolean vfy_by_wbmstr=false; //ED VERIFIED OR NOT

    @Column(nullable = true)
    private LocalDateTime vfy_date_wbmstr; //TIMESTAMP OF ED VERIFICATION

    @Column(nullable = false)
    private boolean snt_bk_by_wbmstr=false;//IS THE DOMAIN REQUEST SENT BACK TO DRM


    private String wbmstr_remarks; //REMARKS GIVEN BY ED

    @Column(nullable = false)
    private boolean vfy_by_hod_hpc_iand_e=false; //ED VERIFIED OR NOT

    @Column(nullable = true)
    private LocalDateTime vfy_date_hod_hpc; //TIMESTAMP OF ED VERIFICATION

    @Column(nullable = false)
    private boolean snt_bk_by_hpc=false;//IS THE DOMAIN REQUEST SENT BACK TO DRM

    private String hpc_remarks; //REMARKS GIVEN BY ED

    @Column(nullable = false)
    private boolean is_verified=false;




}
