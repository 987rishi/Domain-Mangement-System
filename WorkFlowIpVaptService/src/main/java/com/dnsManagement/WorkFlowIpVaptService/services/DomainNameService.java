package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.*;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.*;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.NotificationClient;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.StakeHolderClient;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.VaptAndIpRenewalsClient;
import com.dnsManagement.WorkFlowIpVaptService.repo.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class DomainNameService {

  @Value("${WEBHOOK_SECRET}")
  String webhookSecret;

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

  @Autowired
  private StakeHolderClient client;

  @Autowired
  private VaptAndIpRenewalsClient renewalsClient;

  @Autowired
  private DomainRenewalRepo domainRenewalRepo;

  @Transactional
  public ResponseEntity<?> addDomainRequest(@Valid DomainNameRequest domainNameRequest) {

//    System.out.println("Domain Name Request="+domainNameRequest.toString());


    //Updating drm and arm records with details provided during form submission
    UpdateDrmAndArmDetails drmDetails =
            buildUpdateDetails(domainNameRequest, Role.DRM);
    UpdateDrmAndArmDetails armDetails =
            buildUpdateDetails(domainNameRequest, Role.ARM);

    System.out.println("DRM DETAILS="+drmDetails.toString());


    try {
      client.updateDrmOrArmDetails(domainNameRequest
                      .getDrmInfo()
                      .getEmpNo()
                      .toString(),
              drmDetails);
      client.updateDrmOrArmDetails(domainNameRequest
                      .getArmInfo()
                      .getEmpNo()
                      .toString(),
              armDetails);

    } catch (Exception e) {
      System.out.println("ERROR OCCURED");
      throw new RuntimeException(e);
    }



    Drm drm = utility.findOrThrowNoSuchElementException("DRM", Drm.class,
            domainNameRequest
                    .getDrmInfo()
                    .getEmpNo());

    Arm arm = utility.findOrThrowNoSuchElementException("ARM", Arm.class,
            domainNameRequest
                    .getArmInfo()
                    .getEmpNo());


    Hod hod = utility.findOrThrowNoSuchElementException("HOD", Hod.class,
            domainNameRequest
                    .getApproverInfo()
                    .getHodEmpNo());

    System.out.println("ED EMP NO="+domainNameRequest.getApproverInfo().getEdEmpNo());

    EdCentreHead edCentreHead = utility.findOrThrowNoSuchElementException("ED", EdCentreHead.class,
            domainNameRequest
                    .getApproverInfo()
                    .getEdEmpNo());

    MemberNetops memberNetops = utility.findOrThrowNoSuchElementException("NETOPS", MemberNetops.class,
            domainNameRequest
                    .getApproverInfo()
                    .getNetopsEmpNo());

    WebMaster webMaster = utility.findOrThrowNoSuchElementException("WEBMASTER", WebMaster.class,
            domainNameRequest
                    .getApproverInfo()
                    .getWebmasterEmpNo());

    HodHpcIandE hodHpcIandE = utility.findOrThrowNoSuchElementException("HODHPC", HodHpcIandE.class,
            domainNameRequest
                    .getApproverInfo()
                    .getHodHpcEmpNo());



    System.out.println("DRM="+drm.toString());
    System.out.println("ARM="+arm.toString());
    System.out.println("HOD="+hod.toString());
    System.out.println("ED="+edCentreHead.toString());
    System.out.println("NETOPS="+memberNetops.toString());
    System.out.println("HODHPC="+hodHpcIandE.toString());

    DomainVerification domainVerification = new DomainVerification();

    DomainName domainName = buildDomainName(
            domainNameRequest,
            drm,
            arm,
            hod,
            edCentreHead,
            memberNetops,
            webMaster,
            hodHpcIandE);

    Ip ip = buildIp(domainName, domainNameRequest);
    Vapt vapt = buildVapt(ip, domainNameRequest);


    domainVerification.setDomainName(domainName);

    try {
      //ORDER IN WHICH SAVE IS PERFORMED MATTERS
      DomainName dn = domainNameRepo.save(domainName);
      ipRepo.save(ip);
      vaptRepo.save(vapt);
      domainVerificationRepo.save(domainVerification);
//      RAJ HAS NOT WRITTEN LOGIC FOR IT YET
      notificationClient.sendNotification(webhookSecret, buildNotification(domainName));

      return new ResponseEntity<>(dn, HttpStatus.CREATED);
    } catch (Exception e) {
      return new ResponseEntity<>("ERROR OCCURED WHILE" +
              " SAVING DOMAIN NAME WITH ERROR : " +
              e.getMessage(),
              HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  private UpdateDrmAndArmDetails buildUpdateDetails(@Valid DomainNameRequest domainNameRequest, Role role) {
    UpdateDrmAndArmDetails details = new UpdateDrmAndArmDetails();
    if (role == Role.DRM) {
      details.setDesignation(domainNameRequest.getDrmInfo().getDesignation());
      details.setMobNumber(domainNameRequest.getDrmInfo().getMobileNumber());
      details.setTeleNumber(domainNameRequest.getDrmInfo().getTeleNumber());

    } else {
      details.setDesignation(domainNameRequest.getArmInfo().getDesignation());
      details.setMobNumber(domainNameRequest.getArmInfo().getMobileNumber());
      details.setTeleNumber(domainNameRequest.getArmInfo().getTeleNumber());
    }
    return details;
  }

  private DomainName buildDomainName(DomainNameRequest req,
                                     Drm drm,
                                     Arm arm,
                                     Hod hod,
                                     EdCentreHead ed,
                                     MemberNetops netops,
                                     WebMaster wm,
                                     HodHpcIandE hpc) {
    DomainName dn = new DomainName();
    dn.setDomainName(req
            .getDomainDetails()
            .getDomainName());
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
    dn.setVaptCompletionStatus(req.getVaptCompliance().isCompliant());
    dn.setApprovalProofVaptCompletionStatus(req.getVaptCompliance().getApprovalProof());
    dn.setMouStatus(req.getComplianceStatus().getMouStatus());
    dn.setPeriodInYears(req.getDomainDetails().getPeriodInYears());
    dn.setServerHardeningStatus(req.getIpDetails().isServerHardeningStatus());
    return dn;
  }

  private Ip buildIp(DomainName domainName, DomainNameRequest req) {
    Ip ip = new Ip();
    ip.setIpAddress(req
            .getIpDetails()
            .getPublicIpAddress());
    ip.setIpIssuer(req
            .getIpDetails()
            .getIpIssuer());
    ip.setDomainName(domainName);
    ip.setExpiryDate(req
            .getIpDetails()
            .getIpExpiryDate());
    return ip;
  }

  private Vapt buildVapt(Ip ip, DomainNameRequest req) {
    Vapt vapt = new Vapt();
    vapt.setIp(ip);
    vapt.setVaptCertifyAuthority(req
            .getVaptCompliance()
            .getCertifyingAuthority());
    vapt.setVaptRemarks(req
            .getVaptCompliance()
            .getRemarks());
    vapt.setExpiryDate(req
            .getVaptCompliance()
            .getCertificateExpiryDate());
    vapt.setProofOfWork(req
            .getVaptCompliance()
            .getApprovalProof());
    return vapt;
  }

  private NotificationWebhook buildNotification(DomainName domainName) {

    String remarks = "DOMAIN NAME APPLICATION HAS" +
            " BEEN SUCCESSFULLY SUBMITTED." +
            " PLEASE TRACK YOUR APPLICATION" +
            " STATUS IN THE PORTAL";
    NotificationWebhook.EventType eventType = NotificationWebhook
            .EventType
            .DOMAIN_APPLICATION_SUBMITTED;
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
                    domainName.getArmEmployeeNumber()
            )
    );

  }

  public ResponseEntity<?> updateDomain(@Positive Long dmId, @Valid UpdateDomainName updateDomainName) {
    DomainName domainName =
            domainNameRepo.
                    findById(dmId)
                    .orElseThrow(() ->
                            new NoSuchElementException("DOMAIN NAME DOES " +
                                    "NOT EXIST CORRESPONDING ID: " + dmId));

    Long newDrmEmpNo = Long.parseLong(updateDomainName.getDrmEmpNo());
    Drm newDrm = utility.findOrThrowNoSuchElementException("DRM", Drm.class,
            newDrmEmpNo);

    domainName.setDrmEmployeeNumber(newDrm.getEmpNo());


    try {
      domainNameRepo.save(domainName);
      return new ResponseEntity<>("SUCCESSFULLY UPDATED",
              HttpStatus.OK);
    } catch (RuntimeException e) {
      throw new RuntimeException(e);
    }

  }

  public ResponseEntity<?> getDomain(Long dmId) {
    DomainName domainName = domainNameRepo
            .findById(dmId)
            .orElseThrow(() ->
                    new NoSuchElementException("DOMAIN NAME DOES NOT EXIST " +
                            "CORRESPONDING TO ID: " + dmId));


    return new ResponseEntity<>(buildDomainResponse(domainName), HttpStatus.OK);
  }

  private DomainResponse buildDomainResponse(final DomainName domainName) {
    DomainResponse response = new DomainResponse();
    response.setDomainNameId(domainName.getDomainNameId());
    response.setDomainName(domainName.getDomainName());
    response.setArmEmployeeNumber(domainName.getArmEmployeeNumber());
    response.setDrmEmployeeNumber(domainName.getDrmEmployeeNumber());
    response.setHodEmployeeNumber(domainName.getHodEmployeeNumber());
    response.setEdEmployeeNumber(domainName.getEdEmployeeNumber());
    response.setNetopsEmployeeNumber(domainName.getNetopsEmployeeNumber());
    response.setHodHpcEmployeeNumber(domainName.getHodHpcEmployeeNumber());
    response.setRenewal(domainName.isRenewal());
    response.setActive(domainName.isActive());
    response.setDeleted(domainName.isDeleted());
    response.setVaptCompliantStatus(domainName.isVaptCompletionStatus());
    return response;

  }

  @Transactional
  public ResponseEntity<?> getExpiringDomains(@Positive Long drmId) {

    List<DomainName> domainNameList = domainNameRepo.findByDrmId(drmId);
    if (domainNameList.isEmpty())
      return new ResponseEntity<>(domainNameList, HttpStatus.OK);

    List<ExpiringDomains> expiringDomainsList = new ArrayList<>();

    for (DomainName domain : domainNameList) {
      ExpiringDomains expiringDomains = new ExpiringDomains();
      Arm arm = utility
              .findOrThrowNoSuchElementException(
                      "ARM",
                      Arm.class,
                      domain.getArmEmployeeNumber());
      expiringDomains.setDomainName(domain.getDomainName());
      expiringDomains.setDomainId(domain.getDomainNameId());
      expiringDomains.setArmName(arm.getFirstName() + " " + arm.getLastName());
      expiringDomains.setArmEmail(arm.getEmail());
      expiringDomains.setArmMobile(arm.getMobileNumber());
      expiringDomains.setExpiringDate(domain.getExpiryDate().toLocalDate());
      expiringDomains.setArmEmpNo(domain.getArmEmployeeNumber());

      expiringDomainsList.add(expiringDomains);

    }

    return new ResponseEntity<>(expiringDomainsList, HttpStatus.OK);
  }

  @Transactional
  public ResponseEntity<?> getDomainRenewal(@Positive Long domainId) {
    DomainName domainName = domainNameRepo
            .findById(domainId)
            .orElseThrow(() ->
                    new NoSuchElementException("DOMAIN NAME DOES NOT EXIST " +
                            "CORRESPONDING TO ID: " + domainId));
    DomainNameRenewalRequest domainNameRenewalRequest =
            buildDomainNameRenewalRequest(domainName);

    return new ResponseEntity<>(domainNameRenewalRequest,HttpStatus.OK);

  }

  private DomainNameRenewalRequest buildDomainNameRenewalRequest(
          DomainName domainName) {

    Drm drm = utility.findOrThrowNoSuchElementException(
            "DRM",
            Drm.class,
            domainName.getDrmEmployeeNumber());

    Arm arm = utility.findOrThrowNoSuchElementException(
            "ARM",
            Arm.class,
            domainName.getArmEmployeeNumber());

    DomainNameRenewalRequest renewalRequest = new DomainNameRenewalRequest();

    DomainNameRenewalRequest.PersonInfo drmPersonInfo =
            new DomainNameRenewalRequest
            .PersonInfo();

    DomainNameRenewalRequest.PersonInfo armPersonInfo =
            new DomainNameRenewalRequest
                    .PersonInfo();


    DomainNameRenewalRequest.ApproverInfo approverInfo = new DomainNameRenewalRequest
            .ApproverInfo();

    DomainNameRenewalRequest.DomainDetails domainDetails = new DomainNameRenewalRequest
            .DomainDetails();

    DomainNameRenewalRequest.IpDetails ipDetails =
            new DomainNameRenewalRequest
                    .IpDetails();
    DomainNameRenewalRequest.ComplianceStatus complianceStatus = new DomainNameRenewalRequest
            .ComplianceStatus();

    DomainNameRenewalRequest.VaptCompliance vaptCompliance =
            new DomainNameRenewalRequest
                    .VaptCompliance();
    Ip ip = ipRepo.findByDomainId(domainName
            .getDomainNameId())
            .orElseThrow(() ->
                    new NoSuchElementException(
                            "IP RECORD DOES NOT EXIST " +
                                    "CORRESPONDING TO" +
                                    "DOMAIN ID:" +
                                    domainName.getDomainNameId()
                    ));

    Vapt vapt = vaptRepo.findByIpId(ip.getIpId())
                    .orElseThrow(() ->
            new NoSuchElementException(
                    "VAPT RECORD DOES NOT EXIST " +
                            "CORRESPONDING TO" +
                            "IP ID:" +
                            ip.getIpId()
            ));


    drmPersonInfo.setFirstName(drm.getFirstName());
    drmPersonInfo.setLastName(drm.getLastName());
    drmPersonInfo.setEmail(drm.getEmail());
    drmPersonInfo.setEmpNo(drm.getEmpNo());
    drmPersonInfo.setDesignation(drm.getDesignation());
    drmPersonInfo.setMobileNumber(drm.getMobileNumber());
    drmPersonInfo.setTeleNumber(drm.getTelephoneNumber());
    drmPersonInfo.setCentreId(drm.getCentreId().intValue());
    drmPersonInfo.setGroupId(drm.getGroupId().intValue());
    drmPersonInfo.setGroupName(utility
            .findGroupOrThrowNoSuchElementException(
                    GroupDepartment.class,
                    drm.getGroupId())
            .getDepartmentName());
    drmPersonInfo.setCentreName(utility
            .findCentreOrThrowNoSuchElementException(
                    Centre.class,
                    drm.getCentreId())
            .getCentreName());


    armPersonInfo.setFirstName(arm.getFirstName());
    armPersonInfo.setLastName(arm.getLastName());
    armPersonInfo.setEmail(arm.getEmail());
    armPersonInfo.setEmpNo(arm.getEmployeeNumber());
    armPersonInfo.setDesignation(arm.getDesignation());
    armPersonInfo.setMobileNumber(arm.getMobileNumber());
    armPersonInfo.setTeleNumber(arm.getTelephoneNumber());
    armPersonInfo.setCentreId(arm.getCentreId().intValue());
    armPersonInfo.setGroupId(arm.getGroupId().intValue());
    armPersonInfo.setGroupName(utility
            .findGroupOrThrowNoSuchElementException(
                    GroupDepartment.class,
                    arm.getGroupId())
            .getDepartmentName());
    armPersonInfo.setCentreName(utility
            .findCentreOrThrowNoSuchElementException(
                    Centre.class,
                    arm.getCentreId())
            .getCentreName());



    approverInfo.setHodEmpNo(domainName.getHodEmployeeNumber());
    approverInfo.setEdEmpNo(domainName.getEdEmployeeNumber());
    approverInfo.setNetopsEmpNo(domainName.getNetopsEmployeeNumber());
    approverInfo.setWebmasterEmpNo(domainName.getWebmasterEmployeeNumber());
    approverInfo.setHodHpcEmpNo(domainName.getHodHpcEmployeeNumber());

    domainDetails.setDomainName(domainName.getDomainName());
    domainDetails.setDescription(domainName.getDomainDescription());
    domainDetails.setServiceType(domainName.getServiceType());
    domainDetails.setPeriodInYears(domainName.getPeriodInYears());

    ipDetails.setIpIssuer(ip.getIpIssuer());
    ipDetails.setPublicIpAddress(ip.getIpAddress());
    ipDetails.setServerHardeningStatus(domainName
            .isServerHardeningStatus());

    complianceStatus.setGigwCompliance(domainName
            .getGigcwCompletionStatus());
    complianceStatus.setMouStatus(domainName
            .getMouStatus());

    vaptCompliance.setVaptCompliant(domainName
            .isVaptCompletionStatus());
    vaptCompliance.setRemarks(vapt.getVaptRemarks());
    vaptCompliance.setCertificateExpiryDate(vapt.getExpiryDate().toLocalDate());
    vaptCompliance.setApprovalProof(vapt.getProofOfWork());
    vaptCompliance.setCertifyingAuthority(vapt.getVaptCertifyAuthority());



    renewalRequest.setDomainId(domainName.getDomainNameId());
    renewalRequest.setDomainDetails(domainDetails);
    renewalRequest.setArmInfo(armPersonInfo);
    renewalRequest.setDrmInfo(drmPersonInfo);

    renewalRequest.setApproverInfo(approverInfo);
    renewalRequest.setComplianceStatus(complianceStatus);
    renewalRequest.setIpDetails(ipDetails);
    renewalRequest.setVaptCompliance(vaptCompliance);

    return renewalRequest;
  }

  @Transactional
  public ResponseEntity<?> getAllDomains(Long empNo, Role role) {
    List<DomainName> domainNameList = domainNameRepo.findAllByRoleAndId(empNo
            ,role.name());
    if (domainNameList.isEmpty())
      return new ResponseEntity<>(domainNameList, HttpStatus.OK);

    List<ExpiringDomains> expiringDomainsList = new ArrayList<>();

    for (DomainName domain : domainNameList) {
      ExpiringDomains expiringDomains = new ExpiringDomains();
      Arm arm = utility
              .findOrThrowNoSuchElementException(
                      "ARM",
                      Arm.class,
                      domain.getArmEmployeeNumber());
      expiringDomains.setDomainName(domain.getDomainName());
      expiringDomains.setDomainId(domain.getDomainNameId());
      expiringDomains.setArmName(arm.getFirstName() + " " + arm.getLastName());
      expiringDomains.setArmEmail(arm.getEmail());
      expiringDomains.setArmMobile(arm.getMobileNumber());
      expiringDomains.setExpiringDate(domain.getExpiryDate().toLocalDate());
      expiringDomains.setArmEmpNo(domain.getArmEmployeeNumber());

      expiringDomainsList.add(expiringDomains);

    }

    return new ResponseEntity<>(expiringDomainsList, HttpStatus.OK);
  }

  @Transactional
  public ResponseEntity<?> getDomainsWithByRoleAndEmpNoInfo(Long empNo,
                                                            Role role) {

    List<DomainNameDto> domainNameList =
            domainNameRepo.findAllDomainRequestsByRoleAndEmpNo(empNo,role.name());


    List<VerifyDomainRequestPageDto> hodResponse = new ArrayList<>();
    //buildDomainRequestRenewalPageView(List<DomainNameDto> domainNameList)
    // response List<VerifyDomainRequestPageDto>
    for(DomainNameDto domainName:domainNameList) {

      VerifyDomainRequestPageDto domainRequest =
              new VerifyDomainRequestPageDto();

      Drm drm = utility
              .findOrThrowNoSuchElementException(
                      "DRM",
                      Drm.class,
                      domainName.getDrmEmpNo());

      Arm arm = utility
              .findOrThrowNoSuchElementException(
                      "ARM",
                      Arm.class,
                      domainName.getArmEmpNo());

      GroupDepartment drmGroup = utility
              .findGroupOrThrowNoSuchElementException(
                      GroupDepartment.class,
                      drm.getGroupId());
      Centre drmCentre = utility
              .findCentreOrThrowNoSuchElementException(
                      Centre.class,
                      drm.getCentreId()
              );

      GroupDepartment armGroup = utility
              .findGroupOrThrowNoSuchElementException(
                      GroupDepartment.class,
                      arm.getGroupId());
      Centre armCentre = utility
              .findCentreOrThrowNoSuchElementException(
                      Centre.class,
                      arm.getCentreId()
              );

      domainRequest.setDomainId(domainName.getDomainId());
      domainRequest.setDomainName(domainName.getDomainName());
      domainRequest.setDrmName(
              drm.getFirstName() + " " +
              drm.getLastName());
      domainRequest.setArmName(
              arm.getFirstName() + " " +
              arm.getLastName()
      );

      domainRequest.setDateOfApplication(domainName
              .getDateOfApplication()
              .toLocalDateTime()
              .toLocalDate());

      if(drmGroup != null || armGroup != null) {
        domainRequest.setDrmGroupName(
                drmGroup.getDepartmentName()
        );
        domainRequest.setDrmCentreName(
                drmCentre.getCentreName()
        );

        domainRequest.setArmGroupName(
                armGroup.getDepartmentName()
        );
        domainRequest.setArmCentreName(
                armCentre.getCentreName()
        );
      }


      hodResponse.add(domainRequest);


    }
    return new ResponseEntity<>(hodResponse,HttpStatus.OK);

  }

  @Transactional
  public ResponseEntity<?> getDetailedDomain(@Positive Long domainId) {

    DomainName domainName = domainNameRepo
            .findByDomainNameId(domainId)
            .orElseThrow(() ->
                    new NoSuchElementException(
                            "DOMAIN NAME DOES NOT EXIST " +
                                    "CORRESPONDING TO DOMAIN ID:" +
                                    " " + domainId
                    ));


    DomainNameRenewalRequest response = buildDomainNameRenewalRequest(domainName);



    String status;


    if(domainName.isActive() && domainName.isRenewal()) {
      status = "Under Renewal";
      DomainRenewal renewal = domainRenewalRepo
              .findByDomainId(domainId)
              .orElseThrow(() ->
                      new NoSuchElementException("DOMAIN RENEWAL RECORD DOES " +
                              "NOT EXIST CORRESPONDING TO DOMAIN ID: " + domainId));


      response.setDomainRenewalApprovalProofByHod(renewal.getApprovalProofByHod());
      response.setReason(renewal.getReason());

    } else if (domainName.isActive()) {
      status = "Active";
      response.setDomainRenewalApprovalProofByHod(null);
      response.setReason(null);
    } else if(domainName.isDeleted()) {
      status = "Domain Deleted";
      response.setDomainRenewalApprovalProofByHod(null);
      response.setReason(null);
    }
    else {
      status = "Unknown Status";
      response.setDomainRenewalApprovalProofByHod(null);
      response.setReason(null);
    }

    System.out.println("STATUS=" + status);
    response.setStatus(status);

    return new ResponseEntity<>(response,HttpStatus.OK);
  }

  public ResponseEntity<?> getRenewalViewByRoleAndEmpNo(Role role, Long empNo) {

    // domainId;
    // domainName;
    // drmName;
    // armName;
    // dateOfApplication;

    List<DomainNameDto> domainNameList =
            domainNameRepo.findDomainRenewalsByRoleAndEmpNo(role.name(),empNo);


    List<VerifyDomainRequestPageDto> response = new ArrayList<>();
    //buildDomainRequestRenewalPageView(List<DomainNameDto> domainNameList)
    // response List<VerifyDomainRequestPageDto>
    for(DomainNameDto domainName:domainNameList) {

      VerifyDomainRequestPageDto domainRequest =
              new VerifyDomainRequestPageDto();

      Drm drm = utility
              .findOrThrowNoSuchElementException(
                      "DRM",
                      Drm.class,
                      domainName.getDrmEmpNo());

      Arm arm = utility
              .findOrThrowNoSuchElementException(
                      "ARM",
                      Arm.class,
                      domainName.getArmEmpNo());

      domainRequest.setDomainId(domainName.getDomainId());
      domainRequest.setDomainName(domainName.getDomainName());
      domainRequest.setDrmName(
              drm.getFirstName() + " " +
                      drm.getLastName());
      domainRequest.setArmName(
              arm.getFirstName() + " " +
                      arm.getLastName()
      );

      domainRequest.setDateOfApplication(domainName
              .getDateOfApplication()
              .toLocalDateTime()
              .toLocalDate());
      response.add(domainRequest);


    }
    return new ResponseEntity<>(response,HttpStatus.OK);


  }

  @Transactional
  public ResponseEntity<?> getTransferDetailsByHod(@Positive Long hodEmpNo) {

    List<TransferRequestDto> transferRequestDtoList;
    try{
       transferRequestDtoList =
              renewalsClient.fetchTransferRecordsByRoleAndEmpNo(hodEmpNo,Role.HOD);

    } catch (Exception e) {
      throw new RuntimeException(e);
    }



    List<ViewTransferDto> responseList = new ArrayList<>();


    for(TransferRequestDto transfer: transferRequestDtoList) {
      if(transfer.getHodApproved() && transfer.getApprovedAt() != null)
        continue;

      DomainName domainName =
              domainNameRepo.findByDomainNameId(Long
                      .parseLong(transfer.getDmId()))
                      .orElseThrow(() ->
                              new NoSuchElementException(
                                      String.format("DOMAIN NAME " +
                                              "CORRESPONDING TO ID: %s DOES " +
                                              "NOT EXIST",transfer.getDmId()
                              )));

      Drm drm = utility.findOrThrowNoSuchElementException(
              "DRM",
              Drm.class,
              domainName.getDrmEmployeeNumber());
      Arm arm = utility.findOrThrowNoSuchElementException(
              "ARM",
              Arm.class,
              domainName.getArmEmployeeNumber());

      ViewTransferDto viewTransferDto = new ViewTransferDto();

      viewTransferDto.setDomainId(domainName.getDomainNameId());
      viewTransferDto.setDomainName(domainName.getDomainName());
      viewTransferDto.setDrmName(drm.getFirstName() + " " + drm.getLastName());
      viewTransferDto.setArmName(arm.getFirstName() + " " + arm.getLastName());
      viewTransferDto.setDateOfApplication(transfer.getCreatedAt());
      viewTransferDto.setTransferId(Long.parseLong(transfer.getTtId()));

      responseList.add(viewTransferDto);
    }


    return new ResponseEntity<>(responseList,HttpStatus.OK);
  }

  public ResponseEntity<?> getAllViewDomains(Long empNo, Role role) {

    System.out.println(String.format("ROLE = %s, emp no = %d",role,empNo));
    List<ViewDomainDBDto> viewDomainDBDtos =
            domainNameRepo.findAllDomainNameByRoleAndEmpNo(empNo,role.name());


    List<ViewDomainResponseDto> domainResponseDtos = new ArrayList<>();

    for(ViewDomainDBDto domainDBDto : viewDomainDBDtos) {

      String status;

      if(domainDBDto.isActive())
        status = "Domain Active";
      else if(domainDBDto.isDeleted())
        status = "Domain Deleted";
      else if (domainDBDto.isRenewal())
        status = "Under Renewal";
      else if(domainDBDto.getDomainExpiryDate() == null)
        status = "Application Submitted";
      else
        status = "Unknown Status";


      ViewDomainResponseDto responseDto = new ViewDomainResponseDto();

      Drm drm = utility.findOrThrowNoSuchElementException("DRM", Drm.class,
              domainDBDto.getDrmEmpNo());

      Centre drmCentre =
              utility.findCentreOrThrowNoSuchElementException(Centre.class,
                      drm.getCentreId());

      GroupDepartment drmGroup =
              utility.findGroupOrThrowNoSuchElementException(GroupDepartment.class,
                      drm.getGroupId());

      if(drm == null|| drmCentre == null || drmGroup == null)
        throw new RuntimeException("drm or centre or group is null");
      System.out.println(drm.toString());

      responseDto.setDomainId(domainDBDto.getDomainId());
      responseDto.setDomainName(domainDBDto.getDomainName());
      responseDto.setDrmName(drm.getFirstName() + " " + drm.getLastName());

      if(domainDBDto.getDomainExpiryDate() != null)
        responseDto.setDomainExpiryDate(domainDBDto
                .getDomainExpiryDate()
                .toLocalDateTime()
                .toLocalDate());
      responseDto.setDrmCentreName(drmCentre.getCentreName());
      responseDto.setDrmGroupName(drmGroup.getDepartmentName());
      responseDto.setStatus(status);

      domainResponseDtos.add(responseDto);

    }
    return new ResponseEntity<>(domainResponseDtos,HttpStatus.OK);
  }

  public ResponseEntity<?> getDomainsToPurchase(Long webmasterId) {

    List<DomainNameDto> domainNameList =
            domainNameRepo.findDomainToPurchaseByWebmasterId(webmasterId);


    List<VerifyDomainRequestPageDto> response = new ArrayList<>();
    //buildDomainRequestRenewalPageView(List<DomainNameDto> domainNameList)
    // response List<VerifyDomainRequestPageDto>
    for(DomainNameDto domainName:domainNameList) {

      VerifyDomainRequestPageDto domainRequest =
              new VerifyDomainRequestPageDto();

      Drm drm = utility
              .findOrThrowNoSuchElementException(
                      "DRM",
                      Drm.class,
                      domainName.getDrmEmpNo());

      Arm arm = utility
              .findOrThrowNoSuchElementException(
                      "ARM",
                      Arm.class,
                      domainName.getArmEmpNo());

      domainRequest.setDomainId(domainName.getDomainId());
      domainRequest.setDomainName(domainName.getDomainName());
      domainRequest.setDrmName(
              drm.getFirstName() + " " +
                      drm.getLastName());
      domainRequest.setArmName(
              arm.getFirstName() + " " +
                      arm.getLastName()
      );

      domainRequest.setDateOfApplication(domainName
              .getDateOfApplication()
              .toLocalDateTime()
              .toLocalDate());

      domainRequest.setDrmGroupName(utility
              .findGroupOrThrowNoSuchElementException(
                      GroupDepartment.class,
                      drm.getGroupId())
              .getDepartmentName());

      domainRequest.setDrmCentreName(utility
              .findCentreOrThrowNoSuchElementException(
                      Centre.class,
                      drm.getCentreId())
              .getCentreName());


      domainRequest.setArmGroupName(utility
              .findGroupOrThrowNoSuchElementException(
                      GroupDepartment.class,
                      arm.getGroupId())
              .getDepartmentName());

      domainRequest.setArmCentreName(utility
              .findCentreOrThrowNoSuchElementException(
                      Centre.class,
                      arm.getCentreId())
              .getCentreName());



      response.add(domainRequest);


    }
    return new ResponseEntity<>(response,HttpStatus.OK);

  }


}


