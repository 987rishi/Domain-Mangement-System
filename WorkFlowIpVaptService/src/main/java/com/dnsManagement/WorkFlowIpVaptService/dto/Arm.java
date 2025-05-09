package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Arm {

  @NotNull
  @JsonProperty("emp_no")
  private Long employeeNumber;

  @NotNull
  @JsonProperty("arm_fname")
  private String firstName;

  @NotNull
  @JsonProperty("arm_lname")
  private String lastName;

  @NotNull
  @JsonProperty("email_id")
  private String email;

  @NotNull
  @Enumerated(EnumType.STRING)
  @JsonProperty("desig")
  private Designation designation;

  @NotNull
  @JsonProperty("tele_no")
  private String telephoneNumber;

  @NotNull
  @JsonProperty("mob_no")
  private String mobileNumber;

  @NotNull
  @JsonProperty("centre_id")
  private Long centreId;

  @NotNull
  @JsonProperty("grp_id")
  private Long groupId;

  @NotNull
  @JsonProperty("is_active")
  private boolean active;
}
