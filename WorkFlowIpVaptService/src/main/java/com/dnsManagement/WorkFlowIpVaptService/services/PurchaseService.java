package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.DomainPurchase;
import com.dnsManagement.WorkFlowIpVaptService.dto.NotificationWebhook;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.*;
import com.dnsManagement.WorkFlowIpVaptService.dto.WebMaster;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.NotificationClient;
import com.dnsManagement.WorkFlowIpVaptService.repo.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.NoSuchElementException;

@Service
public class PurchaseService {

    @Value("${WEBHOOK_SECRET}")
    String webhookSecret;

    @Autowired
    private PurchasesRepo purchasesRepo;

    @Autowired
    private DomainNameRepo domainNameRepo;

    @Autowired
    private DomainVerificationRepo domainVerificationRepo;

    @Autowired
    private Utility utility;

    @Autowired
    private IpRepo ipRepo;

    @Autowired
    private VaptRepo vaptRepo;

    @Autowired
    private NotificationClient notificationClient;

    @Transactional
    public ResponseEntity<?> registerDomainPurchase(
            @Valid DomainPurchase domainPurchase) {
        //PERFORM VALIDATION TO CHECK IF DOMAIN NAME IS FINAL APPROVED BEFORE PURCHASE

        DomainVerification domainVerification = domainVerificationRepo
                .findByDomainNameId(
                        domainPurchase
                                .getDomainId())
                .orElseThrow(()->
                        new NoSuchElementException("GIVEN DOMAIN" +
                                " VERIFICATION RECORD DOES" +
                                " NOT EXIST WITH DOMAIN ID : " +
                                domainPurchase.getDomainId()));


        if(!domainVerification.isVerified())
            throw new IllegalStateException("DOMAIN HAS NOT BEEN" +
                    " VERIFIED YET WITH DOMAIN ID: " +
                    domainPurchase.getDomainId());


        DomainName domainName = domainNameRepo.findById(
                domainPurchase
                        .getDomainId())
                .orElseThrow(() ->
                        new NoSuchElementException("THE GIVEN " +
                        "DOMAIN WITH DOES NOT EXIST WITH ID: " +
                                domainPurchase.getDomainId()));

        WebMaster webMaster = utility.findOrThrowNoSuchElementException(
                "WEBMASTER",
                WebMaster.class,
                domainPurchase.getWebMasterId());

        Purchases purchases = new Purchases();

        purchases.setDateOfPurchase(domainPurchase.getDateOfPurchase());

        purchases.setWebmasterId(webMaster.getEmpNo());

        purchases.setProofOfPurchase(Base64
                .getDecoder()
                .decode(
                        domainPurchase
                                .getProofOfWorkBase64Encoded()
                )
        );

        purchases.setDomainName(domainName);

        purchases.setPurchaseType(domainPurchase.getPurchaseType());


        domainName.setExpiryDate(domainPurchase.getDomainExpiryDate());
        domainName.setDateOfActivation(LocalDateTime.now());
        domainName.setPeriodInYears(domainPurchase.getFinalPeriod());
        domainName.setActive(true);
        domainName.setRenewal(false);

//        Ip ip = ipRepo.findByDomainId(
//                domainName
//                        .getDomainNameId())
//                .orElseThrow(() ->
//                        new NoSuchElementException("IP " +
//                        "CORRESPONDING TO DOMAIN " +
//                                "DOES NOT EXIST WITH ID " +
//                                domainName.getDomainNameId()));
//        Vapt vapt = vaptRepo.findByIpId(
//                ip
//                        .getIpId())
//                .orElseThrow(() ->
//                        new NoSuchElementException("VAPT " +
//                "CORRESPONDING TO IP " +
//                                "DOES NOT EXIST WITH ID " +
//                                ip.getIpId()));
//
//        if(ip.getExpiryDate() == null || vapt.getExpiryDate() == null)
//            throw new IllegalStateException("EXPIRY DATE OF IP " +
//                    "AND VAPT CANNOT BE NULL " +
//                    "DURING DOMAIN NAME PURCHASE");
//
//        ip.setActive(true);
//        vapt.setActive(true);


        try{
            domainNameRepo.save(domainName);
//            vaptRepo.save(vapt);
//            ipRepo.save(ip);
            notificationClient.sendNotification(webhookSecret,
                    buildNotification(domainName));

            return new ResponseEntity<>(
                    purchasesRepo.save(purchases),
                    HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException("ERROR OCCURED " +
                    "WHILE SAVING DOMAIN PURCHASE :" + e.getMessage());
        }
    }

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
}
