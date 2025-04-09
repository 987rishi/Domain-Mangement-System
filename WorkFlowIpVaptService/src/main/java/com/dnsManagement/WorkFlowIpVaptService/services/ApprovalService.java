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
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Consumer;

@Service
public class ApprovalService {
    @Autowired
    private DomainVerificationRepo domainVerificationRepo;

    @Autowired
    private DomainRenewalRepo domainRenewalRepo;

    @Autowired
    private DomainNameRepo domainNameRepo;

    @Autowired
    private NotificationClient client;

    private final Map<Role, Consumer<DomainVerification>> roleHandlers = Map.of(
            Role.ARM, dv -> {
                dv.setFwd_arm(true);
                dv.setFwd_date_arm(LocalDateTime.now());
            },
            Role.HOD, dv -> {
                if(!Utility.verifyIfVerifiedByPrevAuth(Role.ARM,Role.HOD,dv))
                    throw new IllegalStateException("HOD CANNOT VERIFY UNLESS ARM HAS VERIFIED");
                hodRenewalVerify(dv);
                dv.setVfyd_by_hod(true);
                dv.setVfy_date_hod(LocalDateTime.now());
            },
            Role.ED, dv -> {
                if(!Utility.verifyIfVerifiedByPrevAuth(Role.HOD,Role.ED,dv))
                    throw new IllegalStateException("ED CANNOT VERIFY UNLESS HOD HAS VERIFIED");
                dv.setVfy_by_ed(true);
                dv.setVfy_date_ed(LocalDateTime.now());
            },
            Role.NETOPS, dv -> {
                if(!Utility.verifyIfVerifiedByPrevAuth(Role.ED,Role.NETOPS,dv))
                    throw new IllegalStateException("NETOPS CANNOT VERIFY UNLESS ED HAS VERIFIED");
                dv.setVfy_by_netops(true);
                dv.setVfy_date_netops(LocalDateTime.now());
            },
            Role.WEBMASTER, dv -> {
                if(!Utility.verifyIfVerifiedByPrevAuth(Role.NETOPS,Role.WEBMASTER,dv))
                    throw new IllegalStateException("WEBMASTER CANNOT VERIFY UNLESS NETOPS HAS VERIFIED");
                dv.setVfy_by_wbmstr(true);
                dv.setVfy_date_wbmstr(LocalDateTime.now());
            },
            Role.HODHPC, dv -> {
                if(!Utility.verifyIfVerifiedByPrevAuth(Role.WEBMASTER,Role.HODHPC,dv))
                    throw new IllegalStateException("HOD HPC CANNOT VERIFY UNLESS WEBMASTER HAS VERIFIED");
                dv.setVfy_by_hod_hpc_iand_e(true);
                dv.setVfy_date_hod_hpc(LocalDateTime.now());
                dv.set_verified(true);
            }
    );

    @Transactional
    public ResponseEntity<?> approve(Long domainNameId, String remarks, Role role) {
        DomainVerification domainVerification = domainVerificationRepo.findByDomainNameId(domainNameId)
                .orElseThrow(() -> new NoSuchElementException("Invalid domain name ID: " + domainNameId));

        DomainName domainName = domainNameRepo.findById(domainNameId).orElseThrow(()->new NoSuchElementException("DOMAIN NAME RECORD DOES NOT EXIST CORRESPONDING TO ID: "+domainNameId));


        // Apply role-specific updates
        roleHandlers.getOrDefault(role, dv -> {
            throw new IllegalArgumentException("Invalid role: " + role);
        }).accept(domainVerification);

        // Set remarks dynamically
        setRemarks(domainVerification, role, remarks);

        try {
            domainVerificationRepo.save(domainVerification);

            NotificationWebhook notificationWebhook = buildNotification(domainName,role,remarks);
            client.sendNotification(notificationWebhook);

            return ResponseEntity.ok(domainVerification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating domain verification: " + e.getMessage());
        }
    }

    private NotificationWebhook buildNotification(DomainName domainName, Role role, String remarks) {
        Long empNo;
        NotificationWebhook.EventType eventType;


         switch (role){
            case ARM -> {
                empNo = domainName.getArm_emp_no();
                eventType = NotificationWebhook.EventType.DOMAIN_ARM_VERIFICATION_FORWARDED;
                break;
            }
            case HOD ->{
                empNo = domainName.getHod_emp_no();
                eventType = NotificationWebhook.EventType.DOMAIN_HOD_VERIFIED;
                break;

            }
            case ED ->{
                empNo = domainName.getEd_emp_no();;
                eventType = NotificationWebhook.EventType.DOMAIN_ED_APPROVED;
                break;

            }
            case NETOPS ->{
                empNo = domainName.getNetops_emp_no();;
                eventType = NotificationWebhook.EventType.DOMAIN_NETOPS_VERIFIED;
                break;

            }
            case WEBMASTER ->{
                empNo = domainName.getWebmaster_emp_no();
                eventType = NotificationWebhook.EventType.DOMAIN_WEBMASTER_VERIFIED;
                break;

            }
            case HODHPC ->{
                empNo = domainName.getHod_hpc_emp_no();
                eventType = NotificationWebhook.EventType.DOMAIN_HPC_HOD_RECOMMENDED;
                break;

            }
            default ->{
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
                         domainName.getDm_id(),
                         domainName.getDm_name(),
                         remarks
                 ),
                 new NotificationWebhook.Recipients(
                         domainName.getDrm_emp_no(),
                         domainName.getArm_emp_no()
                 )
         );

    }

    private void setRemarks(DomainVerification dv, Role role, String remarks) {
        switch (role) {
            case ARM -> dv.setArm_remarks(remarks);
            case HOD -> dv.setHod_remarks(remarks);
            case ED -> dv.setEd_remarks(remarks);
            case NETOPS -> dv.setNetops_remarks(remarks);
            case WEBMASTER -> dv.setWbmstr_remarks(remarks);
            case HODHPC -> dv.setHpc_remarks(remarks);
        }
    }

    private void hodRenewalVerify(DomainVerification dv){
        DomainName domainName = dv.getDm_id();

        if(!domainName.is_renewal())
            return;

        DomainRenewal renewal = domainRenewalRepo.findByDomainId(dv.getDm_id().getDm_id()).orElseThrow(()-> new NoSuchElementException("DOMAIN RENEWAL RECORD DOES NOT EXIST CORRESPONDING TO DOMAIN ID: "+dv.getDm_id().getDm_id()));


        renewal.setHod_appr_date(LocalDateTime.now());

        try{
            domainRenewalRepo.save(renewal);
        }catch(Exception e)
        {
            throw e;
        }
    }
}
