package com.dnsManagement.WorkFlowIpVaptService.services;


import com.dnsManagement.WorkFlowIpVaptService.dto.NotificationWebhook;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainVerification;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainNameRepo;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainVerificationRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Consumer;

@Slf4j
@Service
public class RejectionService {

    @Value("${WEBHOOK_SECRET}")
    String webhookSecret;

    private final DomainVerificationRepo domainVerificationRepo;
    private final DomainNameRepo domainNameRepo;
    private final AsyncNotificationService asyncNotificationService;

    private final Map<Role, Consumer<DomainVerification>> rejectionRole = Map.of(
            Role.HOD,dv -> {
                if(dv.isVerifiedByHod()) throw new IllegalStateException(
                        "HOD CANNOT CHANGE DECISION" +
                                " AFTER VERFIYING");
                dv.setSentBackByHod(true);
                dv.setVerificationDateHod(LocalDateTime.now());
                //notification microservice
            },
            Role.ED,dv->{
                if(dv.isVerifiedByEd()) throw new IllegalStateException("ED " +
                        "CANNOT CHANGE DECISION " +
                        "AFTER VERFIYING");
                if(!Utility.verifyIfSentByPrevAuth(Role.HOD,Role.ED,dv))
                    throw new IllegalStateException("HOD HAS ALREADY" +
                            " REJECTED REQUEST, " +
                            "APPLICATION HAS NOT REACHED ED YET " +
                            "HENCE ED CANNOT REJECT IT NOW");
                dv.setSentBackByEd(true);
                dv.setVerificationDateEd(LocalDateTime.now());
            },
            Role.NETOPS,dv -> {
                if(dv.isVerifiedByNetops()) throw new IllegalStateException("NETOPS" +
                        " CANNOT CHANGE DECISION" +
                        " AFTER VERFIYING");
                if(!Utility.verifyIfSentByPrevAuth(Role.ED,Role.NETOPS,dv))
                    throw new IllegalStateException("ED HAS ALREADY" +
                            " REJECTED REQUEST, " +
                            "APPLICATION HAS NOT REACHED NETOPS" +
                            " YET HENCE NETOPS CANNOT REJECT IT NOW");
                dv.setSentBackByNetops(true);
                dv.setVerificationDateNetops(LocalDateTime.now());
                //notification microservice
            },
            Role.WEBMASTER,dv -> {
                if(dv.isVerifiedByWebmaster()) throw new IllegalStateException("WEBMASTER CANNOT CHANGE" +
                        " DECISION AFTER VERFIYING");
                if(!Utility.verifyIfSentByPrevAuth(Role.NETOPS,Role.WEBMASTER,dv))
                    throw new IllegalStateException("NETOPS HAS ALREADY" +
                            " REJECTED REQUEST, " +
                            "APPLICATION HAS NOT REACHED" +
                            " WEBMASTER YET HENCE WEBMASTER" +
                            " CANNOT REJECT IT NOW");
                dv.setSentBackByWebmaster(true);
                dv.setVerificationDateWebmaster(LocalDateTime.now());
                //notification microservice
            },
            Role.HODHPC,dv -> {
                if(dv.isVerifiedByHodHpcIandE()) throw new
                        IllegalStateException("HOD " +
                        "HPC CANNOT CHANGE DECISION" +
                        " AFTER VERFIYING");
                if(!Utility.verifyIfSentByPrevAuth(Role.WEBMASTER,Role.HODHPC,dv))
                    throw new IllegalStateException("WEBMASTER HAS" +
                            " ALREADY REJECTED REQUEST, " +
                            "APPLICATION HAS NOT REACHED HOD" +
                            " HPC YET HENCE HOD " +
                            "HPC CANNOT REJECT IT NOW");
                dv.setSentBackByHpc(true);
                //notification microservice
                dv.setVerificationDateHodHpc(LocalDateTime.now());
            }
    );

    @Autowired
    public RejectionService(DomainVerificationRepo domainVerificationRepo, DomainNameRepo domainNameRepo, AsyncNotificationService asyncNotificationService) {
        this.domainVerificationRepo = domainVerificationRepo;
        this.domainNameRepo = domainNameRepo;
      this.asyncNotificationService = asyncNotificationService;
    }


    public ResponseEntity<DomainVerification> reject(Long domainNameId,
                                    String remarks,
                                    Role role) {
        log.info("ENTERED reject METHOD with arguments domainNameId:{}, " +
                "remarks:{}, role:{}", domainNameId, remarks, role);

        DomainVerification domainVerification = domainVerificationRepo
                .findByDomainNameId(domainNameId)
                .orElseThrow(() ->
                        new NoSuchElementException("Invalid domain " +
                                "name ID: " + domainNameId));

        DomainName domainName = domainNameRepo
                .findById(domainNameId)
                .orElseThrow(() -> new NoSuchElementException(
                        "DOMAIN NAME " +
                        "RECORD DOES NOT EXIST" +
                                " CORRESPONDING TO ID: " +
                                domainNameId));
        // Apply role-specific updates
        rejectionRole.getOrDefault(role, dv -> {
            throw new IllegalArgumentException("Invalid role: " + role);
        }).accept(domainVerification);

        // Set remarks dynamically
        setRemarks(domainVerification, role, remarks);

        DomainVerification response;
        try {
            response =
                    domainVerificationRepo.save(domainVerification);
        } catch (Exception e) {
            throw new RuntimeException("ERROR OCCURRED WHILE REJECTION STATE SAVE of domain" + e.getMessage());
        }

        log.info("SUCCESSFULLY SAVED REJECTED STATE FOR DOMAIN:{}", domainName);

        log.info("SENDING REJECTION NOTIFICATION");
        asyncNotificationService.sendNotificationAsync(webhookSecret,
                buildNotification(domainName, role, remarks))
                .exceptionally(throwable -> {
                    log.error("Failed to send activation notification for " +
                            "domain: {}", domainName.getDomainName(), throwable);
                    return null;
                });


        return new ResponseEntity<DomainVerification>(response, HttpStatus.OK);
    }

    private void setRemarks(DomainVerification dv,
                            Role role,
                            String remarks) {
        switch (role) {
            case ARM -> dv.setArmRemarks(remarks);
            case HOD -> dv.setHodRemarks(remarks);
            case ED -> dv.setEdRemarks(remarks);
            case NETOPS -> dv.setNetopsRemarks(remarks);
            case WEBMASTER -> dv.setWebmasterRemarks(remarks);
            case HODHPC -> dv.setHpcRemarks(remarks);
        }
    }

    private NotificationWebhook buildNotification(
            DomainName domainName,
            Role role,
            String remarks) {
        Long empNo;
        NotificationWebhook.EventType  eventType = NotificationWebhook
                .EventType.DOMAIN_VERIFICATION_REJECTED;


        switch (role){
            case ARM -> {
                empNo = domainName.getArmEmployeeNumber();
            }
            case HOD -> {
                empNo = domainName.getHodEmployeeNumber();
            }
            case ED -> {
                empNo = domainName.getEdEmployeeNumber();
            }
            case NETOPS -> {
                empNo = domainName.getNetopsEmployeeNumber();

            }
            case WEBMASTER -> {
                empNo = domainName.getWebmasterEmployeeNumber();
            }
            case HODHPC -> {
                empNo = domainName.getHodHpcEmployeeNumber();
            }
            default -> {
                empNo = null;
                eventType = NotificationWebhook.EventType.UNKNOWN_EVENT;
            }
        }

        return new NotificationWebhook(
                eventType,
                LocalDateTime.now(),
                new NotificationWebhook.TriggeredBy(
                        empNo,
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
