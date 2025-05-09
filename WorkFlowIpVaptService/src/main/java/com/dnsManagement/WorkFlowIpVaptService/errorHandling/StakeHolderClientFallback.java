package com.dnsManagement.WorkFlowIpVaptService.errorHandling;

import com.dnsManagement.WorkFlowIpVaptService.dto.ProjectDto;
import com.dnsManagement.WorkFlowIpVaptService.dto.TransferRequestDto;
import com.dnsManagement.WorkFlowIpVaptService.dto.UpdateDrmAndArmDetails;
import com.dnsManagement.WorkFlowIpVaptService.dto.VaptRenewalResponseDTO;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.StakeHolderClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StakeHolderClientFallback implements FallbackFactory<StakeHolderClient> {

  private static final Logger logger = LoggerFactory.getLogger(StakeHolderClientFallback.class);

  @Override
  public StakeHolderClient create(Throwable cause) {
    logger.error("Error in calling user-management-service: {}", cause.getMessage(), cause);

    return new StakeHolderClient() {
      @Override
      public Object fetchStakeHolderDetails(String role, Long empNo) {
        // Return a default response or handle the error accordingly
        return null;
      }

      @Override
      public Object fetchCentreDetails(Long centreId) {
        return null;
      }

      @Override
      public Object fetchDepartmentDetails(Long deptId) {
        return null;
      }

      @Override
      public void updateDrmOrArmDetails(String empNo, UpdateDrmAndArmDetails details) {
      }

      @Override
      public List<ProjectDto> fetchHodAssignedProjects(Long hodEmpNo) {
        return null;
      }
    };
  }
}
