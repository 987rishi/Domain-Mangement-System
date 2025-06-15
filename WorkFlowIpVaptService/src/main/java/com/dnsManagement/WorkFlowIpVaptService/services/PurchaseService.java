package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.DomainPurchase;
import com.dnsManagement.WorkFlowIpVaptService.dto.NotificationWebhook;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.*;
import com.dnsManagement.WorkFlowIpVaptService.dto.WebMaster;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.NotificationClient;
import com.dnsManagement.WorkFlowIpVaptService.repo.*;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.NoSuchElementException;

@Slf4j
@Service

public class PurchaseService {

  @Value("${WEBHOOK_SECRET}")
  String webhookSecret;

  private final  PurchasesRepo purchasesRepo;

  private final DomainNameRepo domainNameRepo;

  private final DomainVerificationRepo domainVerificationRepo;

  private final  Utility utility;

  private final IpRepo ipRepo;

  private final VaptRepo vaptRepo;

  private final AsyncNotificationService asyncNotificationService;

  @Autowired
  public PurchaseService(PurchasesRepo purchasesRepo,
                         DomainNameRepo domainNameRepo,
                         DomainVerificationRepo domainVerificationRepo,
                         Utility utility, IpRepo ipRepo, VaptRepo vaptRepo,
                         NotificationClient notificationClient,
                         AsyncNotificationService asyncNotificationService1) {
    this.purchasesRepo = purchasesRepo;
    this.domainNameRepo = domainNameRepo;
    this.domainVerificationRepo = domainVerificationRepo;
    this.utility = utility;
    this.ipRepo = ipRepo;
    this.vaptRepo = vaptRepo;
    this.asyncNotificationService = asyncNotificationService1;
  }

  @Transactional
  public ResponseEntity<Purchases> registerDomainPurchase(@Valid DomainPurchase domainPurchase) {
    log.info("Registering domain purchase for domain ID: {}", domainPurchase.getDomainId());

    // Phase 1: Validation and pre-condition checks
    validateDomainIsVerified(domainPurchase.getDomainId());

    // Phase 2: Fetch required entities
    DomainName domainName = domainNameRepo.findById(domainPurchase.getDomainId())
            .orElseThrow(() -> new NoSuchElementException("Domain does not exist with ID: " + domainPurchase.getDomainId()));

    WebMaster webMaster = utility.findOrThrowNoSuchElementException(
            "WEBMASTER", WebMaster.class, domainPurchase.getWebMasterId());

    // Phase 3: Build new 'Purchases' entity and update the 'DomainName' entity
    Purchases purchases = buildPurchase(domainPurchase, webMaster, domainName);
    updateDomainOnPurchase(domainName, domainPurchase);

    // Optional: Handle the commented-out IP/VAPT logic cleanly
    // updateIpAndVaptStatus(domainName); // See helper method below

    // Phase 4: Persist all changes within the transaction.
    domainNameRepo.save(domainName);
    Purchases savedPurchase = purchasesRepo.save(purchases);

    log.info("Successfully registered purchase with ID {} for domain '{}'", savedPurchase.getPurchaseId(), domainName.getDomainName());

    // Phase 5: Send notification asynchronously after the transaction commits successfully
    sendDomainActivationNotification(domainName);

    return new ResponseEntity<>(savedPurchase, HttpStatus.CREATED);
  }

// --- HELPER METHODS ---

  private void validateDomainIsVerified(Long domainId) {
    DomainVerification verification = domainVerificationRepo.findByDomainNameId(domainId)
            .orElseThrow(() -> new NoSuchElementException("Domain verification record does not exist for domain ID: " + domainId));

    if (!verification.isVerified()) {
      throw new IllegalStateException("Domain has not been verified yet and cannot be purchased. Domain ID: " + domainId);
    }
  }

  private Purchases buildPurchase(DomainPurchase domainPurchase, WebMaster webMaster, DomainName domainName) {
    Purchases purchases = new Purchases();
    purchases.setDateOfPurchase(domainPurchase.getDateOfPurchase());
    purchases.setWebmasterId(webMaster.getEmpNo());
    purchases.setProofOfPurchase(Base64.getDecoder().decode(domainPurchase.getProofOfWorkBase64Encoded()));
    purchases.setDomainName(domainName);
    purchases.setPurchaseType(domainPurchase.getPurchaseType());
    return purchases;
  }

  private void updateDomainOnPurchase(DomainName domainName, DomainPurchase domainPurchase) {
    domainName.setExpiryDate(domainPurchase.getDomainExpiryDate());
    domainName.setDateOfActivation(LocalDateTime.now());
    domainName.setPeriodInYears(domainPurchase.getFinalPeriod());
    domainName.setActive(true);
    domainName.setRenewal(false);
  }

  private void sendDomainActivationNotification(DomainName domainName) {
    log.info("Queuing DOMAIN_ACTIVATED notification for domain: {}", domainName.getDomainName());
    asyncNotificationService.sendNotificationAsync(webhookSecret, buildNotification(domainName))
            .exceptionally(ex -> {
              log.error("Failed to send activation notification for domain: {}", domainName.getDomainName(), ex);
              return null; // Required for exceptionally block
            });
  }

  /**
   * This is a helper `buildNotification` method.
   */
  private NotificationWebhook buildNotification(DomainName domainName) {
    String remarks = "DOMAIN NAME IS APPLICATION HAS " +
            "BEEN SUCCESSFULLY COMPLETED " +
            "AND IS NOW AVAILABLE FOR USE.";
    NotificationWebhook.EventType eventType = NotificationWebhook
            .EventType.DOMAIN_ACTIVATED;
    Role role = Role.WEBMASTER;

    return new NotificationWebhook(
            eventType,
            LocalDateTime.now(),
            new NotificationWebhook.TriggeredBy(
                    domainName.getWebmasterEmployeeNumber(),
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

  /**
   * [OPTIONAL BUT RECOMMENDED]
   * This method cleanly encapsulates the temporarily disabled IP/VAPT logic.
   */
  private void updateIpAndVaptStatus(DomainName domainName) {
    // TODO: Re-enable this logic once IP and VAPT activation is required at purchase.
    /*
    Ip ip = ipRepo.findByDomainId(domainName.getDomainNameId())
            .orElseThrow(() -> new NoSuchElementException("IP for domain does not exist: " + domainName.getDomainNameId()));
    Vapt vapt = vaptRepo.findByIpId(ip.getIpId())
            .orElseThrow(() -> new NoSuchElementException("VAPT for IP does not exist: " + ip.getIpId()));

    if(ip.getExpiryDate() == null || vapt.getExpiryDate() == null) {
        throw new IllegalStateException("Expiry date of IP and VAPT cannot be null during domain purchase");
    }

    ip.setActive(true);
    vapt.setActive(true);

    // Remember to save them if you uncomment this
    ipRepo.save(ip);
    vaptRepo.save(vapt);
    */
  }
}
