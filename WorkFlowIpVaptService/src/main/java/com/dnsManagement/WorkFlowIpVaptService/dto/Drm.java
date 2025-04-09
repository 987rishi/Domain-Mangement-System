package com.dnsManagement.WorkFlowIpVaptService.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Drm {

    private Long emp_no;//Clarify whether emp_no can fit in long or need to keep string

    @NotNull
    private String drm_fname;

    @NotNull
    private String drm_lname;

    @NotNull
    private String email_id;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Designation desig;

    @NotNull

    private String tele_no;

    @NotNull
    private String mob_no;

    @NotNull
    private Long centre_id;


    @NotNull
    private Long grp_id;

    @NotNull
    private boolean is_active;


}
