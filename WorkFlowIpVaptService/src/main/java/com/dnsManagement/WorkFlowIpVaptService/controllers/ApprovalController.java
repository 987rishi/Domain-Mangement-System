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

/**
 * Manages the multi-level approval workflow for domain verification.
 * <p>
 * This controller provides REST endpoints corresponding to different approval stages,
 * each associated with a specific user role (e.g., ARM, HOD, NETOPS). It receives approval
 * or verification requests and delegates the processing to the {@link ApprovalService}.
 * </p>
 * All endpoints are mapped under the base path {@code /workflow}.
 *
 * @see com.dnsManagement.WorkFlowIpVaptService.services.ApprovalService
 * @see com.dnsManagement.WorkFlowIpVaptService.dto.ApprovalRequest
 * @see com.dnsManagement.WorkFlowIpVaptService.models.DomainVerification
 */
@RestController
@RequestMapping("/workflow")
public class ApprovalController {
    private static final Logger logger =
            LoggerFactory.getLogger(ApprovalController.class);

    private final ApprovalService approvalService;

    /**
     * Constructs a new ApprovalController with the required service dependency.
     *
     * @param approvalService The service responsible for handling the approval logic, injected by Spring.
     */
    @Autowired
    public ApprovalController(ApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    /**
     * Processes an approval submission from an ARM (Account Relationship Manager).
     * <p>
     * This endpoint handles HTTP POST requests to {@code /workflow/arm/verifies}. It expects an
     * {@link ApprovalRequest} in the request body, which is then used to process the approval
     * for the ARM role.
     * </p>
     *
     * @param approvalRequest The request body containing the {@code domainNameId} and {@code remarks}.
     *                        It is automatically validated via {@link jakarta.validation.Valid}.
     * @return A {@link ResponseEntity} containing the updated {@link DomainVerification} object
     *         after the approval and an appropriate HTTP status code.
     */
    @PostMapping("arm/verifies")
    public ResponseEntity<DomainVerification> armConsent(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        logger.info("DOMAIN-NAME-ID={} received for ARM approval", domainNameId);

        String armRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId, armRemarks, Role.ARM);
    }

    /**
     * Processes a verification submission from an HOD (Head of Department).
     * <p>
     * This endpoint handles HTTP POST requests to {@code /workflow/hod/verifies}. It processes the
     * approval for the HOD role.
     * </p>
     *
     * @param approvalRequest The request body containing the {@code domainNameId} and {@code remarks}.
     * @return A {@link ResponseEntity} containing the updated {@link DomainVerification} object.
     */
    @PostMapping("hod/verifies")
    public ResponseEntity<DomainVerification> hodVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        String hodRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId, hodRemarks, Role.HOD);
    }

    /**
     * Processes a verification submission from an ED (Executive Director).
     * <p>
     * This endpoint handles HTTP POST requests to {@code /workflow/ed/verifies}. It processes the
     * approval for the ED role.
     * </p>
     *
     * @param approvalRequest The request body containing the {@code domainNameId} and {@code remarks}.
     * @return A {@link ResponseEntity} containing the updated {@link DomainVerification} object.
     */
    @PostMapping("ed/verifies")
    public ResponseEntity<DomainVerification> edVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        String edRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId, edRemarks, Role.ED);
    }

    /**
     * Processes a verification submission from the NETOPS (Network Operations) team.
     * <p>
     * This endpoint handles HTTP POST requests to {@code /workflow/netops/verifies}. It processes
     * the approval for the NETOPS role.
     * </p>
     *
     * @param approvalRequest The request body containing the {@code domainNameId} and {@code remarks}.
     * @return A {@link ResponseEntity} containing the updated {@link DomainVerification} object.
     */
    @PostMapping("netops/verifies")
    public ResponseEntity<DomainVerification> netopsVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        String netopsRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId, netopsRemarks, Role.NETOPS);
    }

    /**
     * Processes a verification submission from the WEBMASTER team.
     * <p>
     * This endpoint handles HTTP POST requests to {@code /workflow/webmaster/verifies}. It processes
     * the approval for the WEBMASTER role.
     * </p>
     *
     * @param approvalRequest The request body containing the {@code domainNameId} and {@code remarks}.
     * @return A {@link ResponseEntity} containing the updated {@link DomainVerification} object.
     */
    @PostMapping("webmaster/verifies")
    public ResponseEntity<DomainVerification> webmasterVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        String webmasterRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId, webmasterRemarks, Role.WEBMASTER);
    }

    /**
     * Processes a verification submission from the HODHPC (Head of HPC).
     * <p>
     * This endpoint handles HTTP POST requests to {@code /workflow/hodhpc/verifies}. It processes
     * the approval for the HODHPC role.
     * </p>
     *
     * @param approvalRequest The request body containing the {@code domainNameId} and {@code remarks}.
     * @return A {@link ResponseEntity} containing the updated {@link DomainVerification} object.
     */
    @PostMapping("hodhpc/verifies")
    public ResponseEntity<DomainVerification> hpcVerifies(@RequestBody @Valid ApprovalRequest approvalRequest){
        Long domainNameId = approvalRequest.getDomainNameId();
        logger.info("INSIDE HPC VERIFIES for DOMAIN-NAME-ID={}", domainNameId);

        String hpcRemarks = approvalRequest.getRemarks();
        return approvalService.approve(domainNameId, hpcRemarks, Role.HODHPC);
    }
}