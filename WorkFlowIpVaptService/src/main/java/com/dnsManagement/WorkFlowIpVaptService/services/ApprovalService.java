package com.dnsManagement.WorkFlowIpVaptService.services;


import com.dnsManagement.WorkFlowIpVaptService.dto.NotificationWebhook;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainRenewal;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainVerification;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;

import com.dnsManagement.WorkFlowIpVaptService.openfeign.NotificationClient;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainNameRepo;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainRenewalRepo;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainVerificationRepo;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Consumer;

@Slf4j
@Service
public class ApprovalService {


  @Value("${WEBHOOK_SECRET}")
    String webhookSecret;


    private final DomainVerificationRepo domainVerificationRepo;

    private final DomainRenewalRepo domainRenewalRepo;

    private final DomainNameRepo domainNameRepo;

    private final NotificationClient client;


  @Autowired
  public ApprovalService(DomainVerificationRepo domainVerificationRepo, DomainRenewalRepo domainRenewalRepo, DomainNameRepo domainNameRepo, NotificationClient client) {
    this.domainVerificationRepo = domainVerificationRepo;
    this.domainRenewalRepo = domainRenewalRepo;
    this.domainNameRepo = domainNameRepo;
    this.client = client;
  }

    private final Map<Role, Consumer<DomainVerification>> roleHandlers = Map.of(
            Role.ARM, dv -> {
                dv.setForwardedToArm(true);
                dv.setForwardedDateArm(LocalDateTime.now());
            },
            Role.HOD, dv -> {
                if(!Utility.verifyIfVerifiedByPrevAuth(Role.ARM,Role.HOD,dv))
                    throw new IllegalStateException("HOD CANNOT VERIFY UNLESS ARM HAS VERIFIED");
                hodRenewalVerify(dv);
                dv.setVerifiedByHod(true);
                dv.setVerificationDateHod(LocalDateTime.now());
            },
            Role.ED, dv -> {
                if(!Utility.verifyIfVerifiedByPrevAuth(Role.HOD,Role.ED,dv))
                    throw new IllegalStateException("ED CANNOT VERIFY UNLESS HOD HAS VERIFIED");
                dv.setVerifiedByEd(true);
                dv.setVerificationDateEd(LocalDateTime.now());
            },
            Role.NETOPS, dv -> {
                if(!Utility.verifyIfVerifiedByPrevAuth(Role.ED,Role.NETOPS,dv))
                    throw new IllegalStateException("NETOPS CANNOT VERIFY UNLESS ED HAS VERIFIED");
                dv.setVerifiedByNetops(true);
                dv.setVerificationDateNetops(LocalDateTime.now());
            },
            Role.WEBMASTER, dv -> {
                if(!Utility.verifyIfVerifiedByPrevAuth(Role.NETOPS,Role.WEBMASTER,dv))
                    throw new IllegalStateException("WEBMASTER CANNOT VERIFY UNLESS NETOPS HAS VERIFIED");
                dv.setVerifiedByWebmaster(true);
                dv.setVerificationDateWebmaster(LocalDateTime.now());
            },
            Role.HODHPC, dv -> {
                if(!Utility.verifyIfVerifiedByPrevAuth(Role.WEBMASTER,Role.HODHPC,dv))
                    throw new IllegalStateException("HOD HPC CANNOT VERIFY UNLESS WEBMASTER HAS VERIFIED");
                dv.setVerifiedByHodHpcIandE(true);
                dv.setVerificationDateHodHpc(LocalDateTime.now());
                dv.setVerified(true);
            }
    );

    @Transactional
    public ResponseEntity<DomainVerification> approve(Long domainNameId, String remarks,
                                     Role role) {
        DomainVerification domainVerification = domainVerificationRepo
                .findByDomainNameId(domainNameId)
                .orElseThrow(() ->
                        new NoSuchElementException("Invalid domain name ID: " +
                                domainNameId));

        DomainName domainName = domainNameRepo
                .findById(domainNameId)
                .orElseThrow(() ->
                        new NoSuchElementException("DOMAIN NAME " +
                        "RECORD DOES NOT EXIST CORRESPONDING TO ID: " + domainNameId));


        // Apply role-specific updates
        roleHandlers.getOrDefault(role, dv -> {
            throw new IllegalArgumentException("Invalid role: " + role);
        }).accept(domainVerification);

        // Set remarks dynamically
        setRemarks(domainVerification, role, remarks);

        try {
            domainVerificationRepo.save(domainVerification);

            NotificationWebhook notificationWebhook = buildNotification(
                    domainName,
                    role,
                    remarks);
//  ON WHEN RAJ HAS FINSIHED IT
            client.sendNotification(webhookSecret , notificationWebhook);
            log.info("NOTIFICATION SEND:{}", notificationWebhook);

            return ResponseEntity.ok(domainVerification);
        } catch (Exception e) {
            throw new RuntimeException("ERROR WHILE " +
                    "APPROVE WORKFLOW."
                    + e.getMessage()
                    );
        }
    }

    private NotificationWebhook buildNotification(
            DomainName domainName,
            Role role,
            String remarks) {

        Long empNo;
        NotificationWebhook.EventType eventType;
        NotificationWebhook.Recipients recipients = new NotificationWebhook.Recipients();

      NotificationWebhook notification = new NotificationWebhook();
      boolean isRenewal = domainName.isRenewal();
      
         switch (role){
            case ARM -> {
              empNo = domainName.getArmEmployeeNumber();
              if(!isRenewal)
                eventType =
                        NotificationWebhook.EventType.DOMAIN_ARM_VERIFICATION_FORWARDED;
              else
                eventType =
                        NotificationWebhook.EventType.DOMAIN_RENEWAL_ARM_FORWARDED;

              recipients.setDrmEmpNo(domainName.getDrmEmployeeNumber());
              recipients.setArmEmpNo(domainName.getArmEmployeeNumber());
              recipients.setHodEmpNo(domainName.getHodEmployeeNumber());
            }
            case HOD ->{
                empNo = domainName.getHodEmployeeNumber();
                if(!isRenewal)
                  eventType = NotificationWebhook.EventType.DOMAIN_HOD_VERIFIED;
                else
                  eventType =
                          NotificationWebhook.EventType.DOMAIN_RENEWAL_HOD_VERIFIED;
                recipients.setDrmEmpNo(domainName.getDrmEmployeeNumber());
                recipients.setArmEmpNo(domainName.getArmEmployeeNumber());
                recipients.setHodEmpNo(domainName.getHodEmployeeNumber());
                recipients.setEdEmpNo(domainName.getEdEmployeeNumber());

            }
            case ED ->{
                empNo = domainName.getEdEmployeeNumber();
                if(!isRenewal)
                  eventType = NotificationWebhook.EventType.DOMAIN_ED_APPROVED;
                else
                  eventType =
                          NotificationWebhook.EventType.DOMAIN_RENEWAL_ED_APPROVED;

              recipients.setDrmEmpNo(domainName.getDrmEmployeeNumber());
              recipients.setArmEmpNo(domainName.getArmEmployeeNumber());
              recipients.setEdEmpNo(domainName.getEdEmployeeNumber());
              recipients.setNetopsEmpNo(domainName.getNetopsEmployeeNumber());
            }
            case NETOPS ->{
              empNo = domainName.getNetopsEmployeeNumber();
              if(!isRenewal)
                eventType = NotificationWebhook.EventType.DOMAIN_NETOPS_VERIFIED;
              else
                eventType =
                        NotificationWebhook.EventType.DOMAIN_RENEWAL_NETOPS_VERIFIED;

              recipients.setDrmEmpNo(domainName.getDrmEmployeeNumber());
              recipients.setArmEmpNo(domainName.getArmEmployeeNumber());
              recipients.setNetopsEmpNo(domainName.getNetopsEmployeeNumber());
              recipients.setWebmasterEmpNo(domainName.getWebmasterEmployeeNumber());
            }
            case WEBMASTER ->{
              empNo = domainName.getWebmasterEmployeeNumber();
              if(!isRenewal)
                eventType = NotificationWebhook.EventType.DOMAIN_WEBMASTER_VERIFIED;
              else
                eventType =
                          NotificationWebhook.EventType.DOMAIN_RENEWAL_WEBMASTER_VERIFIED;

              recipients.setDrmEmpNo(domainName.getDrmEmployeeNumber());
              recipients.setArmEmpNo(domainName.getArmEmployeeNumber());
              recipients.setWebmasterEmpNo(domainName.getWebmasterEmployeeNumber());
              recipients.setHodHpcEmpNo(domainName.getHodHpcEmployeeNumber());
            }
            case HODHPC ->{
              empNo = domainName.getHodHpcEmployeeNumber();
              if(!isRenewal)
                eventType = NotificationWebhook.EventType.DOMAIN_HPC_HOD_RECOMMENDED;
              else
                eventType =
                        NotificationWebhook.EventType.DOMAIN_RENEWAL_HPC_HOD_RECOMMENDED;

              recipients.setDrmEmpNo(domainName.getDrmEmployeeNumber());
              recipients.setArmEmpNo(domainName.getArmEmployeeNumber());
              recipients.setWebmasterEmpNo(domainName.getWebmasterEmployeeNumber());
              recipients.setHodHpcEmpNo(domainName.getHodHpcEmployeeNumber());
            }
            default ->{
                empNo = null;
                eventType = NotificationWebhook.EventType.UNKNOWN_EVENT;
            }
        }
          notification.setEventType(eventType);
          notification.setTimestamp(LocalDateTime.now());
          notification.setTriggeredBy(new NotificationWebhook.TriggeredBy(
                      empNo,
                      role
              ));
          notification.setNotificationData(new NotificationWebhook.NotificationData(
                  domainName.getDomainNameId(),
                  domainName.getDomainName(),
                  remarks
          ));
          notification.setRecipients(recipients);

         return notification;

    }

    private void setRemarks(DomainVerification dv, Role role, String remarks) {
        switch (role) {
            case ARM -> dv.setArmRemarks(remarks);
            case HOD -> dv.setHodRemarks(remarks);
            case ED -> dv.setEdRemarks(remarks);
            case NETOPS -> dv.setNetopsRemarks(remarks);
            case WEBMASTER -> dv.setWebmasterRemarks(remarks);
            case HODHPC -> dv.setHpcRemarks(remarks);
            default -> throw new IllegalArgumentException("ILLEGAL ROLE:" + role);
        }
    }

    @Transactional
    public void hodRenewalVerify(DomainVerification dv) {
        DomainName domainName = dv.getDomainName();

        if(!domainName.isRenewal())
            return;

        DomainRenewal renewal =
                domainRenewalRepo.findByDomainId(dv
                        .getDomainName()
                        .getDomainNameId())
                        .orElseThrow(()-> new NoSuchElementException("DOMAIN RENEWAL " +
                                "RECORD DOES NOT EXIST " +
                                "CORRESPONDING TO DOMAIN ID: " + dv
                                .getDomainName()
                                .getDomainNameId()));


        renewal.setHodApprovalDate(LocalDateTime.now());


        domainRenewalRepo.save(renewal);

    }
}
