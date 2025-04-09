package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.*;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.*;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.NotificationClient;
import com.dnsManagement.WorkFlowIpVaptService.repo.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class DomainNameService {

    @Autowired
    private DomainNameRepo domainNameRepo;

    @Autowired
    private IpRepo ipRepo;

    @Autowired
    private VaptRepo vaptRepo;

    @Autowired
    private DomainVerificationRepo domainVerificationRepo;

    @Autowired
    private Utility utility;

    @Autowired
    private NotificationClient notificationClient;

    @Transactional
    public ResponseEntity<?> addDomainRequest(@Valid DomainNameRequest domainNameRequest) {

        Drm drm = utility.findOrThrowNoSuchElementException("DRM",Drm.class,domainNameRequest.getDrm_emp_no());

        Arm arm = utility.findOrThrowNoSuchElementException("ARM",Arm.class,domainNameRequest.getArm_emp_no());

        Hod hod = utility.findOrThrowNoSuchElementException("HOD",Hod.class,domainNameRequest.getHod_emp_no());

        EdCentreHead edCentreHead = utility.findOrThrowNoSuchElementException("ED",EdCentreHead.class,domainNameRequest.getEd_emp_no());

        MemberNetops memberNetops = utility.findOrThrowNoSuchElementException("NETOPS",MemberNetops.class,domainNameRequest.getNetops_emp_no());

        WebMaster webMaster = utility.findOrThrowNoSuchElementException("WEBMASTER",WebMaster.class,domainNameRequest.getWebmaster_emp_no());

        HodHpcIandE hodHpcIandE = utility.findOrThrowNoSuchElementException("HODHPC",HodHpcIandE.class,domainNameRequest.getHod_hpc_emp_no());


        DomainVerification domainVerification = new DomainVerification();

        DomainName domainName= buildDomainName(domainNameRequest,drm,arm,hod,edCentreHead,memberNetops,webMaster,hodHpcIandE);
        Ip ip= buildIp(domainName,domainNameRequest);
        Vapt vapt = buildVapt(ip,domainNameRequest);


        domainVerification.setDm_id(domainName);

        try {
            //ORDER IN WHICH SAVE IS PERFORMED MATTERS
            DomainName dn= domainNameRepo.save(domainName);
            ipRepo.save(ip);
            vaptRepo.save(vapt);
            notificationClient.sendNotification(buildNotification(domainName));
            domainVerificationRepo.save(domainVerification);
            return new ResponseEntity<>(dn,HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("ERROR OCCURED WHILE SAVING DOMAIN NAME WITH ERROR : "+e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    private DomainName buildDomainName(DomainNameRequest req, Drm drm, Arm arm, Hod hod,
                                       EdCentreHead ed, MemberNetops netops, WebMaster wm, HodHpcIandE hpc) {
        DomainName dn = new DomainName();
        dn.setDm_name(req.getDm_name());
        dn.setD_o_apl(LocalDateTime.now());
        dn.setDrm_emp_no(drm.getEmp_no());
        dn.setArm_emp_no(arm.getEmp_no());
        dn.setHod_emp_no(hod.getEmp_no());
        dn.setEd_emp_no(ed.getEmp_no());
        dn.setNetops_emp_no(netops.getEmp_no());
        dn.setWebmaster_emp_no(wm.getEmp_no());
        dn.setHod_hpc_emp_no(hpc.getEmp_no());
        dn.setService_type(req.getService_type());
        dn.setGigcw_comp(req.getGigwCompliance());
        dn.setVapt_comp(req.isVaptCompliant());
        dn.setAppr_prf_vapt_comp(req.getApprovalProofVaptCompliant());
        dn.setMou_status(req.getMouStatus());
        dn.setPeriod(req.getPeriod());
        dn.setServ_hard_status(req.isServerHardeningStatus());
        return dn;
    }

    private Ip buildIp(DomainName domainName,DomainNameRequest req){
        Ip ip = new Ip();
        ip.setIp_address(req.getPublicIpAddress());
        ip.setIp_issuer(req.getIpIssuer());
        ip.setDm_id(domainName);
        ip.setExpiry_date(req.getIpExpiryDate());
        return  ip;
    }
    private Vapt buildVapt(Ip ip,DomainNameRequest req){
        Vapt vapt = new Vapt();
        vapt.setIp_id(ip);
        vapt.setVapt_certify_auth(req.getVaptCertifyingAuthority());
        vapt.setVapt_remarks(req.getVaptRemarks());
        vapt.setExp_date(req.getVaptCertificateExpiryDate());
        vapt.setPrf_work(req.getApprovalProofVaptCompliant());
        return vapt;
    }

    private NotificationWebhook buildNotification(DomainName domainName) {

        String remarks = "DOMAIN NAME APPLICATION HAS BEEN SUCCESSFULLY SUBMITTED. PLEASE TRACK YOUR APPLICATION STATUS IN THE PORTAL";
        NotificationWebhook.EventType eventType = NotificationWebhook.EventType.DOMAIN_APPLICATION_SUBMITTED;
        Role role = Role.DRM;

        return new NotificationWebhook(
                eventType,
                LocalDateTime.now(),
                new NotificationWebhook.TriggeredBy(
                        domainName.getDrm_emp_no(),
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
