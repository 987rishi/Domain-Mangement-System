package com.dnsManagement.WorkFlowIpVaptService.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
public class Purchases {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long purchase_id;


    @ManyToOne
    @JsonIgnore
    @JoinColumn(name="dm_id",nullable = false)
    private DomainName domainName;

    @JsonIgnore
    @NotNull
    private Long wbmstr_id;

    @NotNull
    private LocalDateTime dt_of_purchase;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PurchaseType purchaseType;

    @NotNull
    private byte[] prf_of_purchase;
}
