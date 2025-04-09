package com.dnsManagement.WorkFlowIpVaptService.dto;

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
    private Long emp_no;
    @NotNull
    private String fname;
    @NotNull
    private String lname;
    @NotNull
    private String tele_no;
    @NotNull
    private String mob_no;
    @NotNull
    @Email
    private String email_id;

    @NotNull
    private boolean is_active;

    @NotNull
    private Integer centre_id;//TO IDENTIFY THE WEBMASTER BELONGS TO WHICH CENTRE SINCE HE IS ALSO AN EMPLOYEE AND MUST BELONG TO SOME CENTRE
}
