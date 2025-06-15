package com.dnsManagement.WorkFlowIpVaptService.controllers;


import com.dnsManagement.WorkFlowIpVaptService.dto.DomainNameRenewalRequest;

import com.dnsManagement.WorkFlowIpVaptService.models.DomainRenewal;
import com.dnsManagement.WorkFlowIpVaptService.services.DomainRenewalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/*
* DRM/ARM APPLIES FOR DOMAIN RENEWAL
* THIS CAUSES THE /domainRenewal API TO HIT
* THE API CAUSES THE FIELD _RENEWED TO BE TRUE IN DOMAIN NAME RECORD
* WHICH WILL IMPLY THAT THE DOMAIN VERIFICATION RECORD CORRESPONDING TO THE DOMAIN NAME WILL NOW BE USED FOR RENEWAL
* THE RENEWAL APPROVAL WILL FOLLOW THE SAME APIS AS EXPOSED BY APPROVAL CONTROLLER
* */



@RestController
@RequestMapping("/domainRenewal")
public class RenewalController {

    private final DomainRenewalService domainRenewalService;

    @Autowired
    public RenewalController(DomainRenewalService domainRenewalService) {
        this.domainRenewalService = domainRenewalService;
    }

    @PostMapping("renew")
    public ResponseEntity<DomainRenewal> domainRenewal(@RequestBody @Valid DomainNameRenewalRequest domainNameRenewalRequest){
        return domainRenewalService.applyForRenewal(domainNameRenewalRequest);
    }
}
