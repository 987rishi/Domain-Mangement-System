package com.dnsManagement.WorkFlowIpVaptService.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApprovalRequest {
    @NotNull
    private Long domainNameId;
    @NotNull
    private String remarks;
}
