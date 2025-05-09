package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.dto.IpResponse;
import com.dnsManagement.WorkFlowIpVaptService.dto.UpdateDomainName;
import com.dnsManagement.WorkFlowIpVaptService.dto.VaptResponse;
import com.dnsManagement.WorkFlowIpVaptService.services.DomainNameService;
import com.dnsManagement.WorkFlowIpVaptService.services.IpService;
import com.dnsManagement.WorkFlowIpVaptService.services.VaptService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/exposedApis")
public class VaptIpRenewalMicroserviceApis {

  @Autowired
  private IpService ipService;
  @Autowired
  private VaptService vaptService;

  @Autowired
  private DomainNameService domainNameService;


  @GetMapping("ip/{ipId}")
  ResponseEntity<?> getIpById(@PathVariable @Positive Long ipId) {
    return ipService.getIp(ipId);
  }

  @PutMapping("ip/")
  ResponseEntity<?> updateIpById(@RequestBody @Valid IpResponse ipResponse) {
    return ipService.updateIp(ipResponse);
  }

  @GetMapping("ips")
  ResponseEntity<?> getAllIps() {
    return ipService.getAllIps();
  }

  @GetMapping("vapt/{vaptId}")
  ResponseEntity<?> getVaptById(@PathVariable @Positive Long vaptId) {
    return vaptService.getVapt(vaptId);
  }

  @PutMapping("vapt")
  ResponseEntity<?> updateVaptById(@RequestBody @Valid VaptResponse vaptResponse) {
    return vaptService.updateVapt(vaptResponse);
  }

  @PatchMapping("domain/{dmId}")
  ResponseEntity<?> updateDomainDetails(@PathVariable @Positive Long dmId,
                                        @Valid
                                        @RequestBody
                                        UpdateDomainName
                                                updateDomainName) {
    return domainNameService.updateDomain(dmId, updateDomainName);
  }

  @GetMapping("domain/{dmId}")
  ResponseEntity<?> getDomainName(@PathVariable Long dmId) {
    return domainNameService.getDomain(dmId);
  }

}
