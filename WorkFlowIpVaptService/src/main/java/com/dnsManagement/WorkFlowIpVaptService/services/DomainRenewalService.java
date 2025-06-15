package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.*;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.*;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainNameRepo;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainRenewalRepo;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainVerificationRepo;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

@Service
public class DomainRenewalService {

  private static final Logger log = LoggerFactory.getLogger(DomainRenewalService.class);

  @Value("${WEBHOOK_SECRET}")
  private String webhookSecret;

  private final DomainRenewalRepo domainRenewalRepo;
  private final DomainNameRepo domainNameRepo;
  private final DomainVerificationRepo domainVerificationRepo;
  private final Utility utility;
  private final AsyncNotificationService asyncNotificationService;

  @Autowired
  public DomainRenewalService(DomainRenewalRepo domainRenewalRepo, DomainNameRepo domainNameRepo, DomainVerificationRepo domainVerificationRepo, Utility utility, AsyncNotificationService asyncNotificationService) {
    this.domainRenewalRepo = domainRenewalRepo;
    this.domainNameRepo = domainNameRepo;
    this.domainVerificationRepo = domainVerificationRepo;
    this.utility = utility;
    this.asyncNotificationService = asyncNotificationService;
  }

  /**
   * Applies for a domain renewal. This is a transactional operation that updates the domain,
   * resets its verification status, and creates a new renewal record.
   *
   * @param renewalRequest The request containing renewal details.
   * @return A ResponseEntity containing the newly created DomainRenewal record.
   */
  @Transactional
  public ResponseEntity<DomainRenewal> applyForRenewal(@Valid DomainNameRenewalRequest renewalRequest) {
    log.info("Starting domain renewal application for domain ID: {}", renewalRequest.getDomainId());

    // Phase 1: Fetch all required entities and perform initial validation.
    DomainName domainName = domainNameRepo.findById(renewalRequest.getDomainId())
            .orElseThrow(() -> new NoSuchElementException("Domain name does not exist with ID: " + renewalRequest.getDomainId()));

    if (domainName.isRenewal()) {
      throw new IllegalStateException("Domain with ID " + domainName.getDomainNameId() + " is already undergoing renewal.");
    }

    // Fetch all associated approvers and contacts
    Drm drm = utility.findOrThrowNoSuchElementException("DRM", Drm.class, renewalRequest.getDrmInfo().getEmpNo());
    Arm arm = utility.findOrThrowNoSuchElementException("ARM", Arm.class, renewalRequest.getArmInfo().getEmpNo());
    Hod hod = utility.findOrThrowNoSuchElementException("HOD", Hod.class, renewalRequest.getApproverInfo().getHodEmpNo());
    EdCentreHead edCentreHead = utility.findOrThrowNoSuchElementException("ED", EdCentreHead.class, renewalRequest.getApproverInfo().getEdEmpNo());
    MemberNetops memberNetops = utility.findOrThrowNoSuchElementException("NETOPS", MemberNetops.class, renewalRequest.getApproverInfo().getNetopsEmpNo());
    WebMaster webMaster = utility.findOrThrowNoSuchElementException("WEBMASTER", WebMaster.class, renewalRequest.getApproverInfo().getWebmasterEmpNo());
    HodHpcIandE hodHpcIandE = utility.findOrThrowNoSuchElementException("HODHPC", HodHpcIandE.class, renewalRequest.getApproverInfo().getHodHpcEmpNo());

    DomainVerification domainVerification = domainVerificationRepo.findByDomainNameId(domainName.getDomainNameId())
            .orElseThrow(() -> new NoSuchElementException("Domain verification record for domain ID " + domainName.getDomainNameId() + " does not exist."));

    // Phase 2: Prepare the entities for update (in-memory changes).
    DomainRenewal domainRenewal = buildDomainRenewal(domainName, renewalRequest, hod);
    updateDomainName(renewalRequest, drm, arm, hod, edCentreHead, memberNetops, webMaster, hodHpcIandE, domainName);
    resetDomainVerificationRecord(domainVerification);

    // Phase 3: Persist all changes within the transaction.
    // The previous try-catch block is removed to ensure transactional integrity.
    // Any failure here will now cause a full rollback of all changes.
    domainNameRepo.save(domainName);
    domainVerificationRepo.save(domainVerification);
    DomainRenewal savedRenewal = domainRenewalRepo.save(domainRenewal);

    log.info("Successfully created renewal record with ID {} for domain '{}'.", savedRenewal.getRenewalId(), domainName.getDomainName());

    // Phase 4: Send notification asynchronously after the transaction has successfully committed.
    sendRenewalRequestNotification(domainName);

    return new ResponseEntity<>(savedRenewal, HttpStatus.CREATED);
  }

  /**
   * Triggers an asynchronous notification for the domain renewal request.
   * Failures are logged but do not impact the main transaction.
   */
  private void sendRenewalRequestNotification(DomainName domainName) {
    NotificationWebhook payload = buildNotification(domainName);
    log.info("Queuing DOMAIN_RENEWAL_REQUESTED notification for domain: {}", domainName.getDomainName());
    asyncNotificationService.sendNotificationAsync(webhookSecret, payload)
            .exceptionally(ex -> {
              log.error("Failed to send renewal request notification for domain: {}", domainName.getDomainName(), ex);
              return null; // Required for exceptionally block
            });
  }

  /**
   * Builds a new DomainRenewal entity from the request.
   */
  private DomainRenewal buildDomainRenewal(DomainName domainName, DomainNameRenewalRequest req, Hod hod){
    DomainRenewal domainRenewal = new DomainRenewal();
    domainRenewal.setDomainName(domainName);
    domainRenewal.setReason(req.getReason());
    domainRenewal.setHodEmployeeNumber(hod.getEmployeeNumber());
    domainRenewal.setPreviousDomainName(domainName.getDomainName());
    domainRenewal.setApprovalProofByHod(req.getDomainRenewalApprovalProofByHod());
    return domainRenewal;
  }

  /**
   * Updates an existing DomainName entity with new details from the renewal request.
   */
  private void updateDomainName(DomainNameRenewalRequest req, Drm drm, Arm arm, Hod hod, EdCentreHead ed, MemberNetops netops, WebMaster wm, HodHpcIandE hpc, DomainName dn) {
    dn.setDomainName(req.getDomainDetails().getDomainName());
    dn.setDateOfApplication(LocalDateTime.now());
    dn.setDrmEmployeeNumber(drm.getEmpNo());
    dn.setArmEmployeeNumber(arm.getEmployeeNumber());
    dn.setHodEmployeeNumber(hod.getEmployeeNumber());
    dn.setEdEmployeeNumber(ed.getEmpNo());
    dn.setNetopsEmployeeNumber(netops.getEmpNo());
    dn.setWebmasterEmployeeNumber(wm.getEmpNo());
    dn.setHodHpcEmployeeNumber(hpc.getEmployeeNumber());
    dn.setServiceType(req.getDomainDetails().getServiceType());
    dn.setGigcwCompletionStatus(req.getComplianceStatus().getGigwCompliance());
    dn.setVaptCompletionStatus(req.getVaptCompliance().isVaptCompliant());
    dn.setApprovalProofVaptCompletionStatus(req.getVaptCompliance().getApprovalProof());
    dn.setMouStatus(req.getComplianceStatus().getMouStatus());
    dn.setPeriodInYears(req.getDomainDetails().getPeriodInYears());
    dn.setServerHardeningStatus(req.getIpDetails().isServerHardeningStatus());
    dn.setRenewal(true);
  }

  /**
   * Resets all verification flags and remarks on a DomainVerification record
   * to prepare it for a new approval workflow.
   */
  private void resetDomainVerificationRecord(DomainVerification dv){
    dv.setVerified(false);
    dv.setForwardedToArm(false);
    dv.setForwardedDateArm(null);

    dv.setVerifiedByHod(false);
    dv.setVerificationDateHod(null);

    dv.setVerifiedByEd(false);
    dv.setVerificationDateEd(null);

    dv.setVerifiedByNetops(false);
    dv.setVerificationDateNetops(null);

    dv.setVerifiedByWebmaster(false);
    dv.setVerificationDateWebmaster(null);

    dv.setVerifiedByHodHpcIandE(false);
    dv.setVerificationDateHodHpc(null);

    dv.setSentBackByHod(false);
    dv.setSentBackByEd(false);
    dv.setSentBackByNetops(false);
    dv.setSentBackByWebmaster(false);
    dv.setSentBackByHpc(false);

    dv.setArmRemarks(null);
    dv.setHodRemarks(null);
    dv.setEdRemarks(null);
    dv.setNetopsRemarks(null);
    dv.setWebmasterRemarks(null);
    dv.setHpcRemarks(null);
  }

  /**
   * Builds the notification payload for a domain renewal request.
   */
  private NotificationWebhook buildNotification(DomainName domainName) {
    String remarks = """
            DOMAIN NAME RENEWAL APPLICATION HAS BEEN SUCCESSFULLY SUBMITTED.
            PLEASE TRACK YOUR APPLICATION STATUS IN THE PORTAL.
            """;
    NotificationWebhook.EventType eventType = NotificationWebhook.EventType.DOMAIN_RENEWAL_REQUESTED;
    com.dnsManagement.WorkFlowIpVaptService.models.Role role = Role.DRM;

    return new NotificationWebhook(
            eventType,
            LocalDateTime.now(),
            new NotificationWebhook.TriggeredBy(
                    domainName.getDrmEmployeeNumber(),
                    role
            ),
            new NotificationWebhook.NotificationData(
                    domainName.getDomainNameId(),
                    domainName.getDomainName(),
                    remarks
            ),
            new NotificationWebhook.Recipients(
                    domainName.getDrmEmployeeNumber(),
                    domainName.getArmEmployeeNumber(),
                    null,
                    null,
                    null,
                    null,
                    null
            )
    );
  }
}