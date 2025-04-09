package com.dnsManagement.WorkFlowIpVaptService.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class Centre {
    @NotNull
    private Integer centre_id;
    @NotNull
    private String cn_name;
    @NotNull
    private MemberNetops netops_red;//NETOPS REDIRECTION IN CASE NEED TO BUT PUBLIC IP (IN CASE OF NOIDA)
}
