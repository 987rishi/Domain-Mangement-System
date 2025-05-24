package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.dto.ApprovalRequest;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.services.ApprovalService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/workflow")
public class ApprovalController {

    @Autowired
    private ApprovalService approvalService;

    @PostMapping("arm/verifies")
    public ResponseEntity<?> armConsent(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String armRemarks=approvalRequest.getRemarks();
        return approvalService.approve(domainNameId,armRemarks,Role.ARM);
    }

    @PostMapping("hod/verifies")
    public ResponseEntity<?> hodVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String hodRemarks=approvalRequest.getRemarks();
        return approvalService.approve(domainNameId,hodRemarks,Role.HOD);
    }

    @PostMapping("ed/verifies")
    public ResponseEntity<?> edVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String edRemarks=approvalRequest.getRemarks();
        return approvalService.approve(domainNameId,edRemarks,Role.ED);
    }

    @PostMapping("netops/verifies")
    public ResponseEntity<?> netopsVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String netopsRemarks=approvalRequest.getRemarks();
        return approvalService.approve(domainNameId,netopsRemarks,Role.NETOPS);
    }

    @PostMapping("webmaster/verifies")
    public ResponseEntity<?> webmasterVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String webmasterRemarks=approvalRequest.getRemarks();
        return approvalService.approve(domainNameId,webmasterRemarks,Role.WEBMASTER);
    }


    @PostMapping("hodhpc/verifies")
    public ResponseEntity<?> hpcVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String hpcRemarks=approvalRequest.getRemarks();
        return approvalService.approve(domainNameId,hpcRemarks,Role.HODHPC);
    }

}
