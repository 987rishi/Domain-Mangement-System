package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.dto.DomainPurchase;
import com.dnsManagement.WorkFlowIpVaptService.models.Purchases;
import com.dnsManagement.WorkFlowIpVaptService.services.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/purchase")
public class PurchaseController {
    @Autowired
    private PurchaseService purchaseService;

    @PostMapping("registerDomain")
    public ResponseEntity<Purchases> purchaseDomain(@RequestBody @Valid DomainPurchase domainPurchase){
            return purchaseService.registerDomainPurchase(domainPurchase);
    }

    @PostMapping("renewDomain")
    public ResponseEntity<Purchases> renewDomain(@RequestBody @Valid DomainPurchase domainPurchase){
        return purchaseService.registerDomainPurchase(domainPurchase);
    }
}
