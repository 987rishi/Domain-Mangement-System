package com.dnsManagement.WorkFlowIpVaptService.openfeign;

import com.dnsManagement.WorkFlowIpVaptService.errorHandling.StakeHolderClientFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Optional;

@FeignClient(name = "user-management-service",fallbackFactory = StakeHolderClientFallback.class)
public interface StakeHolderClient {

    @GetMapping("/api/users/details/{role}/{empNo}")
    Object fetchStakeHolderDetails(@PathVariable String role, @PathVariable Long empNo);

    @GetMapping("/get-centre/{centreId}")
    Object fetchCentreDetails(Long centreId);

    @GetMapping("/get-dept/{deptId}")
    Object fetchDepartmentDetails(Long deptId);
}
