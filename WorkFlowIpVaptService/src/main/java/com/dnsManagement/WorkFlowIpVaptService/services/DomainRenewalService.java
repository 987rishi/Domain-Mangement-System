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
    DomainName domainName = domainNameRepo.findById(domainNameRenewalRequest
                    .getDomainId())
            .orElseThrow(()->
                    new NoSuchElementException("DOMAIN NAME DOES NOT EXIST" +
                            " WITH DOMAIN ID: " +
                            domainNameRenewalRequest
                                    .getDomainId()));

    if(domainName.isRenewal())
      throw new IllegalStateException("DOMAIN IS ALREADY UNDERGOING RENEWAL");


    Drm drm = utility.findOrThrowNoSuchElementException(
            "DRM",
            Drm.class,
            domainNameRenewalRequest
                    .getDrmInfo().getEmpNo());

    Arm arm = utility.findOrThrowNoSuchElementException(
            "ARM",
            Arm.class,
            domainNameRenewalRequest
                    .getArmInfo().getEmpNo());


    Hod hod = utility.findOrThrowNoSuchElementException(
            "HOD",
            Hod.class,
            domainNameRenewalRequest
                    .getApproverInfo()
                    .getHodEmpNo());

    EdCentreHead edCentreHead = utility.findOrThrowNoSuchElementException(
            "ED",
            EdCentreHead.class,
            domainNameRenewalRequest
                    .getApproverInfo()
                    .getEdEmpNo());

    MemberNetops memberNetops = utility.findOrThrowNoSuchElementException(
            "NETOPS",
            MemberNetops.class,
            domainNameRenewalRequest
                    .getApproverInfo()
                    .getNetopsEmpNo());

    WebMaster webMaster = utility.findOrThrowNoSuchElementException(
            "WEBMASTER",
            WebMaster.class,
            domainNameRenewalRequest
                    .getApproverInfo()
                    .getWebmasterEmpNo());

    HodHpcIandE hodHpcIandE = utility.findOrThrowNoSuchElementException(
            "HODHPC",
            HodHpcIandE.class,
            domainNameRenewalRequest
                    .getApproverInfo()
                    .getHodHpcEmpNo());


    DomainVerification domainVerification = domainVerificationRepo
            .findByDomainNameId(
                    domainName
                            .getDomainNameId())
            .orElseThrow(()->
                    new NoSuchElementException("NO DOMAIN VERIFICATION " +
                            "RECORD FOR DOMAIN EXISTS WITH ID :" +
                            domainName.getDomainNameId()));


    DomainRenewal domainRenewal= buildDomainRenewal(
            domainName,
            domainNameRenewalRequest,
            hod);


//       //REPLACE THE DOMAIN DATA WITH NEW RENEWAL DATA
    //WILL UPDATE THE EXISTING DOMAIN NAME
    updateDomainName(
            domainNameRenewalRequest,
            drm,
            arm,
            hod,
            edCentreHead,
            memberNetops,
            webMaster,
            hodHpcIandE,
            domainName);

    resetDomainVerificationRecord(domainVerification);

    try{
      domainNameRepo.save(domainName);
      domainVerificationRepo.save(domainVerification);
//      notificationClient.sendNotification(buildNotification(domainName));
      return new ResponseEntity<>(domainRenewalRepo.save(domainRenewal), HttpStatus.CREATED);
    }catch (Exception e){
      throw new RuntimeException("ERROR WHILE " +
              "DOMAIN RENEWAL. " +
              e.getMessage());
    }

  }
  private DomainRenewal buildDomainRenewal(
          DomainName domainName,
          DomainNameRenewalRequest req,
          Hod hod){
    DomainRenewal domainRenewal = new DomainRenewal();
    domainRenewal.setDomainName(domainName);
    domainRenewal.setReason(req.getReason());
    domainRenewal.setHodEmployeeNumber(hod.getEmployeeNumber());
    domainRenewal.setPreviousDomainName(domainName.getDomainName());
    domainRenewal.setApprovalProofByHod(req.getDomainRenewalApprovalProofByHod());
    return domainRenewal;

  }
  private void updateDomainName(
          DomainNameRenewalRequest req,
          Drm drm,
          Arm arm,
          Hod hod,
          EdCentreHead ed,
          MemberNetops netops,
          WebMaster wm,
          HodHpcIandE hpc,
          DomainName dn) {

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

  private NotificationWebhook buildNotification(DomainName domainName) {

    String remarks = "DOMAIN NAME RENEWAL" +
            " APPLICATION HAS BEEN SUCCESSFULLY SUBMITTED." +
            " PLEASE TRACK YOUR APPLICATION STATUS IN THE PORTAL";
    NotificationWebhook.EventType eventType = NotificationWebhook
            .EventType
            .DOMAIN_RENEWAL_REQUESTED;
    Role role = Role.DRM;

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
