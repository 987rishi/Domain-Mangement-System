package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.dto.ApprovalRequest;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;

import com.dnsManagement.WorkFlowIpVaptService.services.RejectionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/workflow")
public class RejectionController {

    @Autowired
    private RejectionService rejectionService;


    @PostMapping("hod/rejects")
    public ResponseEntity<?> hodRejects(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String hodRemarks=approvalRequest.getRemarks();
        return rejectionService.reject(domainNameId,hodRemarks,Role.HOD);
    }

    @PostMapping("ed/rejects")
    public ResponseEntity<?> edVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String edRemarks=approvalRequest.getRemarks();
        return rejectionService.reject(domainNameId,edRemarks,Role.ED);
    }

    @PostMapping("netops/rejects")
    public ResponseEntity<?> netopsVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String netopsRemarks=approvalRequest.getRemarks();
        return rejectionService.reject(domainNameId,netopsRemarks,Role.NETOPS);
    }

    @PostMapping("webmaster/rejects")
    public ResponseEntity<?> webmasterVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String webmasterRemarks=approvalRequest.getRemarks();
        return rejectionService.reject(domainNameId,webmasterRemarks,Role.WEBMASTER);
    }

    @PostMapping("hpc/rejects")
    public ResponseEntity<?> hpcVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId=approvalRequest.getDomainNameId();
        System.out.println("DomainNameID="+domainNameId);

        String hpcRemarks=approvalRequest.getRemarks();
        return rejectionService.reject(domainNameId,hpcRemarks,Role.HODHPC);
    }

}
