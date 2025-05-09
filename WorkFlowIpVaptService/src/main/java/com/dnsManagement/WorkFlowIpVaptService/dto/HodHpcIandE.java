package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HodHpcIandE {

  @NotNull
  @JsonProperty("emp_no")
  private Long employeeNumber;

  @NotNull
  @JsonProperty("fname")
  private String firstName;

  @NotNull
  @JsonProperty("lname")
  private String lastName;

  @NotNull
  @JsonProperty("tele_no")
  private String telephoneNumber;

  @NotNull
  @JsonProperty("mob_no")
  private String mobileNumber;

  @NotNull
  @Email
  @JsonProperty("email_id")
  private String email;

  @NotNull
  @JsonProperty("is_active")
  private boolean isActive;
}
