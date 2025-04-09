package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IpResponse {

    @NotNull
    private Long ip_id;

    @NotNull
    private String ip_address;

    @NotNull
    private String ip_issuer;

    @NotNull
    private LocalDateTime expiry_date;

    @NotNull
    private Long dm_id;

    @NotNull
    private boolean is_active;
}
