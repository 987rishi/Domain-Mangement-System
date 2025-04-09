package com.dnsManagement.WorkFlowIpVaptService.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupDepartment {

    @NotNull
    private Integer dept_id;

    @NotNull
    private String d_name;

    @NotNull
    private Integer centre_id;
}
