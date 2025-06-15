package com.dnsManagement.WorkFlowIpVaptService.controllers;


import com.dnsManagement.WorkFlowIpVaptService.dto.DomainNameRequest;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.services.DomainNameService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/domainRegistration")
public class DomainNameRegistrationController {


  private final DomainNameService domainNameService;

  @Autowired
  public DomainNameRegistrationController(DomainNameService domainNameService) {
    this.domainNameService = domainNameService;
  }

  @PostMapping("domainRegister")
  public ResponseEntity<DomainName> applyForDomain(@RequestBody @Valid DomainNameRequest domainNameRequest){
    return domainNameService.addDomainRequest(domainNameRequest);
  }

}
