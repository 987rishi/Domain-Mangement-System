package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.dnsManagement.WorkFlowIpVaptService.models.Ip;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VaptResponse {

    @NotNull
    private Long vapt_id;

    @NotNull
    private Long ip_id;

    @NotNull
    private LocalDateTime exp_date;

    @NotNull
    private String vapt_certify_auth;

    @NotNull
    private byte[] prf_work;

    @NotNull
    private String vapt_remarks;

    @NotNull
    private boolean is_active;
}
