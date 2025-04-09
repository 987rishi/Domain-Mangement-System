package com.dnsManagement.WorkFlowIpVaptService.services;


import com.dnsManagement.WorkFlowIpVaptService.dto.NotificationWebhook;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainVerification;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.NotificationClient;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainNameRepo;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainVerificationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Consumer;

@Service
public class RejectionService {

    @Autowired
    private DomainVerificationRepo domainVerificationRepo;
    @Autowired
    private NotificationClient notificationClient;
    @Autowired
    private DomainNameRepo domainNameRepo;

    private Map<Role, Consumer<DomainVerification>> rejectionRole=Map.of(
            Role.HOD,dv->{
                if(dv.isVfyd_by_hod()) throw new IllegalStateException("HOD CANNOT CHANGE DECISION AFTER VERFIYING");
                dv.setSnt_bk_by_hod(true);
                dv.setVfy_date_hod(LocalDateTime.now());
                //notification microservice
            },
            Role.ED,dv->{
                if(dv.isVfy_by_ed()) throw new IllegalStateException("ED CANNOT CHANGE DECISION AFTER VERFIYING");
                if(!Utility.verifyIfSentByPrevAuth(Role.HOD,Role.ED,dv))
                    throw new IllegalStateException("HOD HAS ALREADY REJECTED REQUEST, APPLICATION HAS NOT REACHED ED YET HENCE ED CANNOT REJECT IT NOW");
                dv.setSnt_bk_by_ed(true);
                dv.setVfy_date_ed(LocalDateTime.now());
            },
            Role.NETOPS,dv->{
                if(dv.isVfy_by_netops()) throw new IllegalStateException("NETOPS CANNOT CHANGE DECISION AFTER VERFIYING");
                if(!Utility.verifyIfSentByPrevAuth(Role.ED,Role.NETOPS,dv))
                    throw new IllegalStateException("ED HAS ALREADY REJECTED REQUEST, APPLICATION HAS NOT REACHED NETOPS YET HENCE NETOPS CANNOT REJECT IT NOW");
                dv.setSnt_bk_by_netops(true);
                dv.setVfy_date_netops(LocalDateTime.now());
                //notification microservice
            },
            Role.WEBMASTER,dv->{
                if(dv.isVfy_by_wbmstr()) throw new IllegalStateException("WEBMASTER CANNOT CHANGE DECISION AFTER VERFIYING");
                if(!Utility.verifyIfSentByPrevAuth(Role.NETOPS,Role.WEBMASTER,dv))
                    throw new IllegalStateException("NETOPS HAS ALREADY REJECTED REQUEST, APPLICATION HAS NOT REACHED WEBMASTER YET HENCE WEBMASTER CANNOT REJECT IT NOW");
                dv.setSnt_bk_by_wbmstr(true);
                dv.setVfy_date_wbmstr(LocalDateTime.now());
                //notification microservice
            },
            Role.HODHPC,dv->{
                if(dv.isVfy_by_hod_hpc_iand_e()) throw new IllegalStateException("HOD HPC CANNOT CHANGE DECISION AFTER VERFIYING");
                if(!Utility.verifyIfSentByPrevAuth(Role.WEBMASTER,Role.HODHPC,dv))
                    throw new IllegalStateException("WEBMASTER HAS ALREADY REJECTED REQUEST, APPLICATION HAS NOT REACHED HOD HPC YET HENCE HOD HPC CANNOT REJECT IT NOW");
                dv.setSnt_bk_by_hpc(true);
                //notification microservice
                dv.setVfy_date_hod_hpc(LocalDateTime.now());
            }
    );






    public ResponseEntity<?> reject(Long domainNameId, String remarks, Role role) {
        DomainVerification domainVerification = domainVerificationRepo.findByDomainNameId(domainNameId)
                .orElseThrow(() -> new NoSuchElementException("Invalid domain name ID: " + domainNameId));

        DomainName domainName = domainNameRepo.findById(domainNameId).orElseThrow(()->new NoSuchElementException("DOMAIN NAME RECORD DOES NOT EXIST CORRESPONDING TO ID: "+domainNameId));
        // Apply role-specific updates
        rejectionRole.getOrDefault(role, dv -> {
            throw new IllegalArgumentException("Invalid role: " + role);
        }).accept(domainVerification);

        // Set remarks dynamically
        setRemarks(domainVerification, role, remarks);

        try {
            domainVerificationRepo.save(domainVerification);
            notificationClient.sendNotification(buildNotification(domainName,role,remarks));
            return ResponseEntity.ok(domainVerification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating domain verification: " + e.getMessage());
        }
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

    private NotificationWebhook buildNotification(DomainName domainName, Role role, String remarks) {
        Long empNo;
        NotificationWebhook.EventType  eventType = NotificationWebhook.EventType.DOMAIN_VERIFICATION_REJECTED;


        switch (role){
            case ARM -> {
                empNo = domainName.getArm_emp_no();
            }
            case HOD ->{
                empNo = domainName.getHod_emp_no();

            }
            case ED ->{
                empNo = domainName.getEd_emp_no();;
            }
            case NETOPS ->{
                empNo = domainName.getNetops_emp_no();;

            }
            case WEBMASTER ->{
                empNo = domainName.getWebmaster_emp_no();
            }
            case HODHPC ->{
                empNo = domainName.getHod_hpc_emp_no();
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

}
