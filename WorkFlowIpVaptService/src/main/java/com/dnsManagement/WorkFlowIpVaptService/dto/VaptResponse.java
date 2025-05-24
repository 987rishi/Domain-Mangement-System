package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("vapt_id")
    private Long vaptId;

    @NotNull
    @JsonProperty("ip_id")
    private Long ipId;

    @NotNull
    @JsonProperty("exp_date")
    private LocalDateTime expiryDate;

    @NotNull
    @JsonProperty("vapt_certify_auth")
    private String vaptCertifyAuthority;

    @NotNull
    @JsonProperty("prf_work")
    private byte[] proofWork;

    @NotNull
    @JsonProperty("vapt_remarks")
    private String vaptRemarks;

    @NotNull
    @JsonProperty("is_active")
    private boolean isActive;
}
