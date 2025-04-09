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
import java.util.NoSuchElementException;


@Service
public class DomainRenewalService {

    @Autowired
    private DomainRenewalRepo domainRenewalRepo;

    @Autowired
    private DomainNameRepo domainNameRepo;

    @Autowired
    private DomainVerificationRepo domainVerificationRepo;

    @Autowired
    private Utility utility;

    @Autowired
    private NotificationClient notificationClient;

    @Transactional
    public ResponseEntity<?> applyForRenewal(@Valid DomainNameRenewalRequest domainNameRenewalRequest) {

//        //VERIFY THE IS_RENEWAL FLAG IN DOMAIN NAME IS FALSE
//        //LOG ALL THE PREV DATA OF THE DOMAIN NAME RECORD
//
        DomainName domainName = domainNameRepo.findById(domainNameRenewalRequest.getDomainId()).orElseThrow(()-> new NoSuchElementException("DOMAIN NAME DOES NOT EXIST WITH DOMAIN ID: "+domainNameRenewalRequest.getDomainId()));

        if(domainName.is_renewal())
            throw new IllegalStateException("DOMAIN IS ALREADY UNDERGOING RENEWAL");


        Drm drm = utility.findOrThrowNoSuchElementException("DRM", Drm.class,domainNameRenewalRequest.getDrm_emp_no());

        Arm arm = utility.findOrThrowNoSuchElementException("ARM",Arm.class,domainNameRenewalRequest.getArm_emp_no());
        
        
        Hod hod = utility.findOrThrowNoSuchElementException("HOD",Hod.class,domainNameRenewalRequest.getHod_emp_no());

        EdCentreHead edCentreHead = utility.findOrThrowNoSuchElementException("ED", EdCentreHead.class,domainNameRenewalRequest.getEd_emp_no());

        MemberNetops memberNetops = utility.findOrThrowNoSuchElementException("NETOPS", MemberNetops.class,domainNameRenewalRequest.getNetops_emp_no());

        WebMaster webMaster = utility.findOrThrowNoSuchElementException("WEBMASTER", WebMaster.class,domainNameRenewalRequest.getWebmaster_emp_no());

        HodHpcIandE hodHpcIandE = utility.findOrThrowNoSuchElementException("HPC", HodHpcIandE.class,domainNameRenewalRequest.getHod_hpc_emp_no());


        DomainVerification domainVerification = domainVerificationRepo.findByDomainNameId(domainName.getDm_id()).orElseThrow(()-> new NoSuchElementException("NO DOMAIN VERIFICATION RECORD FOR DOMAIN EXISTS WITH ID :" + domainName.getDm_id()));


        DomainRenewal domainRenewal= buildDomainRenewal(domainName,domainNameRenewalRequest,hod);


//       //REPLACE THE DOMAIN DATA WITH NEW RENEWAL DATA
        //WILL UPDATE THE EXISTING DOMAIN NAME
        updateDomainName(domainNameRenewalRequest,drm,arm,hod,edCentreHead,memberNetops,webMaster,hodHpcIandE,domainName);

        resetDomainVerificationRecord(domainVerification);

        try{
            domainNameRepo.save(domainName);
            domainVerificationRepo.save(domainVerification);
            notificationClient.sendNotification(buildNotification(domainName));
            return new ResponseEntity<>(domainRenewalRepo.save(domainRenewal), HttpStatus.CREATED);
        }catch (Exception e){
            throw e;
        }

    }
    private DomainRenewal buildDomainRenewal(DomainName domainName,DomainNameRenewalRequest req,Hod hod){
        DomainRenewal domainRenewal = new DomainRenewal();
        domainRenewal.setDm_id(domainName);
        domainRenewal.setReason(req.getReason());
        domainRenewal.setHod_emp_no(hod.getEmp_no());
        domainRenewal.setPrev_dm_name(domainName.getDm_name());
        domainRenewal.setAppr_prf_by_hod(req.getDomainRenewalApprovalProofByHod());
        return domainRenewal;

    }
    private void updateDomainName(DomainNameRenewalRequest req, Drm drm, Arm arm, Hod hod,
                                       EdCentreHead ed, MemberNetops netops, WebMaster wm, HodHpcIandE hpc,DomainName dn) {

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
        dn.set_renewal(true);
    }
    private void resetDomainVerificationRecord(DomainVerification dv){
        dv.set_verified(false);

        dv.setFwd_arm(false);
        dv.setFwd_date_arm(null);


        dv.setVfyd_by_hod(false);
        dv.setVfy_date_hod(null);


        dv.setVfy_by_ed(false);
        dv.setVfy_date_ed(null);

        dv.setVfy_by_netops(false);
        dv.setVfy_date_netops(null);

        dv.setVfy_by_wbmstr(false);
        dv.setVfy_date_wbmstr(null);

        dv.setVfy_by_hod_hpc_iand_e(false);
        dv.setVfy_date_hod_hpc(null);

        dv.setSnt_bk_by_hod(false);
        dv.setSnt_bk_by_ed(false);
        dv.setSnt_bk_by_netops(false);
        dv.setSnt_bk_by_wbmstr(false);
        dv.setSnt_bk_by_hpc(false);

        dv.setArm_remarks(null);
        dv.setHod_remarks(null);
        dv.setEd_remarks(null);
        dv.setNetops_remarks(null);
        dv.setWbmstr_remarks(null);
        dv.setHpc_remarks(null);
    }

    private NotificationWebhook buildNotification(DomainName domainName) {

        String remarks = "DOMAIN NAME RENEWAL APPLICATION HAS BEEN SUCCESSFULLY SUBMITTED. PLEASE TRACK YOUR APPLICATION STATUS IN THE PORTAL";
        NotificationWebhook.EventType eventType = NotificationWebhook.EventType.DOMAIN_RENEWAL_REQUESTED;
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
