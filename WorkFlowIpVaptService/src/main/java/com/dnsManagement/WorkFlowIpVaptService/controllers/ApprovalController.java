package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.dto.ApprovalRequest;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainVerification;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.services.ApprovalService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/workflow")
public class ApprovalController {
    private static final Logger logger =
            LoggerFactory.getLogger(ApprovalController.class);

    private final ApprovalService approvalService;

    @Autowired
    public ApprovalController(ApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @PostMapping("arm/verifies")
    public ResponseEntity<DomainVerification> armConsent(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        logger.info("DOMAIN-NAME-ID={}", domainNameId);

        String armRemarks=approvalRequest.getRemarks();
        return approvalService.approve(domainNameId,armRemarks,Role.ARM);
    }

    @PostMapping("hod/verifies")
    public ResponseEntity<DomainVerification> hodVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        String hodRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId, hodRemarks, Role.HOD);
    }

    @PostMapping("ed/verifies")
    public ResponseEntity<DomainVerification> edVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        String edRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId, edRemarks, Role.ED);
    }

    @PostMapping("netops/verifies")
    public ResponseEntity<DomainVerification> netopsVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();

        String netopsRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId,netopsRemarks,Role.NETOPS);
    }

    @PostMapping("webmaster/verifies")
    public ResponseEntity<DomainVerification> webmasterVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();

        String webmasterRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId,webmasterRemarks,Role.WEBMASTER);
    }


    @PostMapping("hodhpc/verifies")
    public ResponseEntity<DomainVerification> hpcVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        logger.info("INSIDE HPC VERIFIES");

        String hpcRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId,hpcRemarks,Role.HODHPC);
    }

}
