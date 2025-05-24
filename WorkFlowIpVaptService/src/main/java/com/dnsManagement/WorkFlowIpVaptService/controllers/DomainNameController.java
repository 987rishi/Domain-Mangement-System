package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.services.DomainNameService;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/domain")
public class DomainNameController {

  @Autowired
  private DomainNameService domainNameService;

  @GetMapping("list/renew/{drmId}")
  public ResponseEntity<?> getDomainsById(@PathVariable @Positive Long drmId) {
    return domainNameService.getExpiringDomains(drmId);
  }

  @GetMapping("get/renew/{domainId}")
  public ResponseEntity<?> getDomainByDomainId(@PathVariable @Positive Long domainId) {
    return domainNameService.getDomainRenewal(domainId);
  }

  @GetMapping("get-domains/{role}/{empNo}")
  public ResponseEntity<?> getDomains(@PathVariable Long empNo,
                                      @PathVariable Role role) {
    return domainNameService.getAllDomains(empNo,role);
  }

  @GetMapping("view-domains/{role}/{empNo}")
  public ResponseEntity<?> getViewDomains(@PathVariable("empNo") Long empNo,
                                      @PathVariable("role") Role role) {
    return domainNameService.getAllViewDomains(empNo,role);
  }



  @GetMapping("{role}/domain-verify-requests/{hodEmpNo}")
  public ResponseEntity<?> getDomainVerifyAndInfoByRoleAndEmpNo(@PathVariable Long hodEmpNo,@PathVariable Role role) {
    return domainNameService.getDomainsWithByRoleAndEmpNoInfo(hodEmpNo,role);
  }

  @GetMapping("domain-detail/{domainId}")
  public ResponseEntity<?> getDetailedDomain(@PathVariable @Positive Long domainId) {
    return domainNameService.getDetailedDomain(domainId);
  }

  @GetMapping("domain-renewal/view/{role}/{empNo}")
  public ResponseEntity<?> getRenewalsView(@PathVariable Role role,
                                           @PathVariable Long empNo) {
    return domainNameService.getRenewalViewByRoleAndEmpNo(role,empNo);
  }

  @GetMapping("/view/transfer/hod/{hodEmpNo}")
  public ResponseEntity<?> getTransferRequestsByHod(@PathVariable
                                                      @Positive Long hodEmpNo)
  {
    return domainNameService.getTransferDetailsByHod(hodEmpNo);
  }


  @GetMapping("domain-purchase-view/WEBMASTER/{webmasterId}")
  public ResponseEntity<?> getDomainsForPurchase(@PathVariable Long webmasterId) {
    return domainNameService.getDomainsToPurchase(webmasterId);
  }


}
