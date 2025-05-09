package com.dnsManagement.WorkFlowIpVaptService.openfeign;

import com.dnsManagement.WorkFlowIpVaptService.dto.TransferRequestDto;
import com.dnsManagement.WorkFlowIpVaptService.dto.VaptRenewalResponseDTO;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import jakarta.validation.constraints.Positive;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "RENEWAL-TRANSFER-SERVICE")
public interface VaptAndIpRenewalsClient {

  @GetMapping("/api/renewals/vapt/all/{role}/{empId}")
  List<VaptRenewalResponseDTO> fetchVaptRenewalsByRoleAndEmpNo(
          @PathVariable @Positive Long empId,
          @PathVariable Role role);

  @GetMapping("/api/renewals/vapt/{vaptRenewalId}")
  VaptRenewalResponseDTO fetchVaptRenewalByRenewalId(
          @PathVariable @Positive Long vaptRenewalId);

  //VERIFY THE API
  @GetMapping("/api/transfers/all/{role}/{empNo}")
  List<TransferRequestDto> fetchTransferRecordsByRoleAndEmpNo(
          @PathVariable Long empNo,
          @PathVariable Role role);

}
