package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.dto.ApprovalRequest;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainVerification;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;

import com.dnsManagement.WorkFlowIpVaptService.services.RejectionService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/workflow")
public class RejectionController {

    private final RejectionService rejectionService;

    @Autowired
    public RejectionController(RejectionService rejectionService) {
        this.rejectionService = rejectionService;
    }


    @PostMapping("hod/rejects")
    public ResponseEntity<DomainVerification> hodRejects(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        log.info("INSIDE POST /hod/rejects. DomainNameID:{}", domainNameId);
        String hodRemarks = approvalRequest.getRemarks();
        return rejectionService.reject(domainNameId,hodRemarks,Role.HOD);
    }

    @PostMapping("ed/rejects")
    public ResponseEntity<DomainVerification> edVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        log.info("INSIDE POST /ed/rejects. DomainNameID:{}", domainNameId);;

        String edRemarks = approvalRequest.getRemarks();
        return rejectionService.reject(domainNameId,edRemarks,Role.ED);
    }

    @PostMapping("netops/rejects")
    public ResponseEntity<DomainVerification> netopsVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        log.info("INSIDE POST /netops/rejects. DomainNameID:{}", domainNameId);;

        String netopsRemarks = approvalRequest.getRemarks();
        return rejectionService.reject(domainNameId,netopsRemarks,Role.NETOPS);
    }

    @PostMapping("webmaster/rejects")
    public ResponseEntity<DomainVerification> webmasterVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        log.info("INSIDE POST /webmaster/rejects. DomainNameID:{}",
                domainNameId);;

        String webmasterRemarks = approvalRequest.getRemarks();
        return rejectionService.reject(domainNameId,webmasterRemarks,Role.WEBMASTER);
    }

    @PostMapping("hpc/rejects")
    public ResponseEntity<DomainVerification> hpcVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        log.info("INSIDE POST /hpc/rejects. DomainNameID:{}", domainNameId);;

        String hpcRemarks = approvalRequest.getRemarks();
        return rejectionService.reject(domainNameId,hpcRemarks,Role.HODHPC);
    }

}
