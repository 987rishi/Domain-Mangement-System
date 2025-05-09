package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateDrmAndArmDetails {
  private Designation designation;
  @JsonProperty("tele_no")
  private String teleNumber;
  @JsonProperty("mob_no")
  private String mobNumber;
}
