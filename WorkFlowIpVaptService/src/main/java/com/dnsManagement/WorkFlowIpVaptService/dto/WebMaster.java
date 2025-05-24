package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class WebMaster {

    @NotNull
    @JsonProperty("emp_no")
    private Long empNo;

    @NotNull
    @JsonProperty("fname")
    private String firstName;

    @NotNull
    @JsonProperty("lname")
    private String lastName;

    @NotNull
    @JsonProperty("tele_no")
    private String telePhoneNumber;

    @NotNull
    @JsonProperty("mob_no")
    private String mobileNumber;

    @NotNull
    @Email
    @JsonProperty("email_id")
    private String emailId;

    @NotNull
    @JsonProperty("is_active")
    private boolean isActive;

    @NotNull
    @JsonProperty("centre_id")
    private Integer centreId; // To identify the webmaster belongs to which centre since they are also an employee
}
