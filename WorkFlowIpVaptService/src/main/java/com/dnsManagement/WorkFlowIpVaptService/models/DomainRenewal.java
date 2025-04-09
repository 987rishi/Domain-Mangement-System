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
    private Long id;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name="dm_id",nullable = false)
    private DomainName dm_id;

    @Column(nullable = false)
    private String prev_dm_name;


    private String reason;

    //private LocalDateTime dm_exp_date;

    @Column(name="hod_appr_date",nullable = true)
    private LocalDateTime hod_appr_date;


    @JsonIgnore
    @JoinColumn(name = "hod_emp_no",nullable = false)
    private Long hod_emp_no;

    @Lob
    @NotNull
    @Column(name="appr_prf_by_hod",nullable = false)
    private byte[] appr_prf_by_hod;


}
