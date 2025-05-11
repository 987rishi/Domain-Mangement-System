package com.dnsManagement.WorkFlowIpVaptService.controllers;


import com.dnsManagement.WorkFlowIpVaptService.dto.DomainNameRequest;
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

  @Autowired
  private DomainNameService domainNameService;


  @PostMapping("domainRegister")
  public ResponseEntity<?> applyForDomain(@RequestBody @Valid DomainNameRequest domainNameRequest){
    return domainNameService.addDomainRequest(domainNameRequest);
  }

}
