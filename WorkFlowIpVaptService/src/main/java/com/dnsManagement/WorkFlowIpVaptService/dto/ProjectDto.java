package com.dnsManagement.WorkFlowIpVaptService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDto {
  private Long project_id;
  private String project_name;
  private String project_remarks;
  private Long drm_emp_no;
  private Long arm_emp_no;
  private Long hod_emp_no;
  private EmployeeDto drm;
  private EmployeeDto arm;
  private EmployeeDto hod;
}
