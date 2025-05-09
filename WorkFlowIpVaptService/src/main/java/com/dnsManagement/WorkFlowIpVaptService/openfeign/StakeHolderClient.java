package com.dnsManagement.WorkFlowIpVaptService.openfeign;

import com.dnsManagement.WorkFlowIpVaptService.config.SecurityConfiguration;
import com.dnsManagement.WorkFlowIpVaptService.dto.ProjectDto;
import com.dnsManagement.WorkFlowIpVaptService.dto.TransferRequestDto;
import com.dnsManagement.WorkFlowIpVaptService.dto.UpdateDrmAndArmDetails;
import com.dnsManagement.WorkFlowIpVaptService.dto.VaptRenewalResponseDTO;
import com.dnsManagement.WorkFlowIpVaptService.errorHandling.StakeHolderClientFallback;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import jakarta.validation.constraints.Positive;
import jakarta.ws.rs.GET;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "user-management-service",fallbackFactory =
        StakeHolderClientFallback.class)
public interface StakeHolderClient {

  @GetMapping("/api/users/details/{role}/{empNo}")
  Object fetchStakeHolderDetails(@PathVariable String role, @PathVariable Long empNo);

  @GetMapping("/api/users/centre/{centreId}")
  Object fetchCentreDetails(@PathVariable Long centreId);

  @GetMapping("/api/users/group/{deptId}")
  Object fetchDepartmentDetails(@PathVariable Long deptId);


  @RequestMapping(method = RequestMethod.PUT, value = "/api/update/users/{empNo}")
//  @PatchMapping("/api/update/users/{empNo}")
  void updateDrmOrArmDetails(@PathVariable String empNo,
                             @RequestBody UpdateDrmAndArmDetails details);

  @GetMapping("/api/users/list/projects/{hodEmpNo}")
  List<ProjectDto> fetchHodAssignedProjects(@PathVariable @Positive Long hodEmpNo);



}
