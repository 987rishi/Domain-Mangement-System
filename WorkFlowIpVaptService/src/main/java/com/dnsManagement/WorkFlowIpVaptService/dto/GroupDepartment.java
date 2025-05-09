package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupDepartment {

  @NotNull
  @JsonProperty("dept_id")
  private Integer departmentId;

  @NotNull
  @JsonProperty("d_name")
  private String departmentName;

  @NotNull
  @JsonProperty("centre_id")
  private Integer centreId;
}
