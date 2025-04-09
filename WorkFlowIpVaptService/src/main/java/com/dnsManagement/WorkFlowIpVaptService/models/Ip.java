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
public class Ip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ip_id;

    @Column(name="ip_address",nullable = false,unique = true)
    private String ip_address;

    @NotNull
    @Column(nullable = false)
    private String ip_issuer;

    private LocalDateTime expiry_date;

    @OneToOne
    @JoinColumn(name="dm_id",nullable = false)
    private DomainName dm_id;

    @Column(nullable = false)
    private boolean is_active = false;
}
