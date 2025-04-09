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
    private Long vapt_id;

    @OneToOne
    @JoinColumn(name="ip_id",nullable = false,unique = true)
    private Ip ip_id;

    private LocalDateTime exp_date;

    @NotNull
    @Column(nullable = false)
    private String vapt_certify_auth;

    @Lob
    @NotNull
    @Column(name="prf_work",nullable = false)
    private byte[] prf_work;

    private String vapt_remarks;

    @Column(nullable = false)
    private boolean is_active = false;

}
