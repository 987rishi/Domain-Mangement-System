package com.dnsManagement.WorkFlowIpVaptService.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberNetops {

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
    private Integer centre_id;

    @NotNull
    private boolean is_active;
}
