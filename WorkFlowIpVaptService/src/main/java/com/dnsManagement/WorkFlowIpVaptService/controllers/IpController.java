package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.services.IpService;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/ip-management")
public class IpController {

  private final IpService ipService;

  @Autowired
  public IpController(IpService ipService) {
    this.ipService = ipService;
  }

  @GetMapping("validation/check-unique")
  public ResponseEntity<String> checkIfIpUnique(@NotNull @RequestParam(
          "ipAddr") String ipAddr) {
    log.info("IP ADDRESS={}", ipAddr);
    return ipService.isUnique(ipAddr);
  }
}
