package com.dnsManagement.WorkFlowIpVaptService.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EdCentreHead {

    @NotNull
    private Long emp_no;//Clarify whether emp_no can fit in long or need to keep string
    @NotNull
    private String fname;
    @NotNull
    private String lname;
    @NotNull
    @Email
    private String email_id;
    @NotNull
    private String tele_no;
    @NotNull
    private String mob_no;

    @NotNull
    private Long centre_id;

    @NotNull
    private boolean is_active;
}
