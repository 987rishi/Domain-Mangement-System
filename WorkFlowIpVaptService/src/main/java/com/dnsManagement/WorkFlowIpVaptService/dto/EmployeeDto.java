package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDto {
  private Long emp_no;
  private String desig;
  private String drm_fname; // or arm_fname/hod_fname depending on context
  private String drm_lname;
  private String arm_fname;
  private String arm_lname;
  private String hod_fname;
  private String hod_lname;
  private String email_id;
  private String tele_no;
  private String mob_no;
  private Integer centre_id;
  private Integer grp_id;
  private Boolean is_active;
}

