package com.dnsManagement.WorkFlowIpVaptService.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Hod {

    @NotNull
    private Long emp_no;//Clarify whether emp_no can fit in long or need to keep string
    @NotNull
    private String hod_fname;
    @NotNull
    private String hod_lname;
    @NotNull
    @Email
    private String email_id;
    @NotNull
    private String tele_no;
    @NotNull
    private String mob_no;

    @NotNull
    private Integer centre_id;
    @NotNull
    private Integer grp_id;

    @NotNull
    private boolean is_active;
}
