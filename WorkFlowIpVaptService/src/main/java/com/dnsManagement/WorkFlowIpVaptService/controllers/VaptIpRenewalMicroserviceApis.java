package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.dto.DomainResponse;
import com.dnsManagement.WorkFlowIpVaptService.dto.IpResponse;
import com.dnsManagement.WorkFlowIpVaptService.dto.UpdateDomainName;
import com.dnsManagement.WorkFlowIpVaptService.dto.VaptResponse;
import com.dnsManagement.WorkFlowIpVaptService.models.Ip;
import com.dnsManagement.WorkFlowIpVaptService.models.Vapt;
import com.dnsManagement.WorkFlowIpVaptService.services.DomainNameService;
import com.dnsManagement.WorkFlowIpVaptService.services.IpService;
import com.dnsManagement.WorkFlowIpVaptService.services.VaptService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/exposedApis")
public class VaptIpRenewalMicroserviceApis {

  private final IpService ipService;
  private final VaptService vaptService;

  private final DomainNameService domainNameService;

  @Autowired
  public VaptIpRenewalMicroserviceApis(IpService ipService, VaptService vaptService, DomainNameService domainNameService) {
    this.ipService = ipService;
    this.vaptService = vaptService;
    this.domainNameService = domainNameService;
  }


  @GetMapping("ip/{ipId}")
  public ResponseEntity<IpResponse> getIpById(@PathVariable @Positive Long ipId) {
    return ipService.getIp(ipId);
  }

  @PutMapping("ip/")
  public ResponseEntity<Ip> updateIpById(@RequestBody @Valid IpResponse ipResponse) {
    return ipService.updateIp(ipResponse);
  }

  @GetMapping("ips")
  ResponseEntity<List<Ip>> getAllIps() {
    return ipService.getAllIps();
  }

  @GetMapping("vapt/{vaptId}")
  ResponseEntity<VaptResponse> getVaptById(@PathVariable @Positive Long vaptId) {
    return vaptService.getVapt(vaptId);
  }

  @PutMapping("vapt")
  ResponseEntity<Vapt> updateVaptById(@RequestBody @Valid VaptResponse vaptResponse) {
    return vaptService.updateVapt(vaptResponse);
  }

  @PatchMapping("domain/{dmId}")
  ResponseEntity<String> updateDomainDetails(@PathVariable @Positive Long dmId,
                                        @Valid
                                        @RequestBody
                                        UpdateDomainName
                                                updateDomainName) {
    return domainNameService.updateDomain(dmId, updateDomainName);
  }



  @GetMapping("domain/{dmId}")
  ResponseEntity<DomainResponse> getDomainName(@PathVariable Long dmId) {
    return domainNameService.getDomain(dmId);
  }

}
