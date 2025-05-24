package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Centre {

  @NotNull
  @JsonProperty("centre_id")
  private Integer centreId;

  @NotNull
  @JsonProperty("cn_name")
  private String centreName;

  @NotNull
  @JsonProperty("netops_red")
  private Long netopsRedirection;
}
