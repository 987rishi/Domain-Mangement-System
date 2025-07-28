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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@Service
public class DomainNameService {

  @Value("${WEBHOOK_SECRET}")
  String webhookSecret;

  private final DomainNameRepo domainNameRepo;

  private final IpRepo ipRepo;

  private final VaptRepo vaptRepo;

  private final DomainVerificationRepo domainVerificationRepo;

  private final Utility utility;


  private final StakeHolderClient client;

  private final VaptAndIpRenewalsClient renewalsClient;

  private final DomainRenewalRepo domainRenewalRepo;

  private final AsyncNotificationService asyncNotificationService;

  @Autowired
  public DomainNameService(DomainNameRepo domainNameRepo, IpRepo ipRepo, VaptRepo vaptRepo, DomainVerificationRepo domainVerificationRepo, Utility utility, NotificationClient notificationClient, StakeHolderClient client, VaptAndIpRenewalsClient renewalsClient, DomainRenewalRepo domainRenewalRepo, AsyncNotificationService asyncNotificationService) {
    this.domainNameRepo = domainNameRepo;
    this.ipRepo = ipRepo;
    this.vaptRepo = vaptRepo;
    this.domainVerificationRepo = domainVerificationRepo;
    this.utility = utility;
    this.client = client;
    this.renewalsClient = renewalsClient;
    this.domainRenewalRepo = domainRenewalRepo;
    this.asyncNotificationService = asyncNotificationService;
  }

  @Transactional
  public ResponseEntity<DomainName> addDomainRequest(@Valid DomainNameRequest domainNameRequest) {
    log.info("Starting new domain request processing for: {}",
            domainNameRequest.getDomainDetails().getDomainName());

    // Phase 1: Update external systems via Feign client.
    // This is wrapped in a helper method for clarity. If it fails, the entire transaction will roll back.
    updateExternalDrmAndArmInfo(domainNameRequest);

    // Phase 2: Fetch all related entities from the local database.
    Drm drm = utility.findOrThrowNoSuchElementException("DRM", Drm.class, domainNameRequest.getDrmInfo().getEmpNo());
    Arm arm = utility.findOrThrowNoSuchElementException("ARM", Arm.class, domainNameRequest.getArmInfo().getEmpNo());
    Hod hod = utility.findOrThrowNoSuchElementException("HOD", Hod.class, domainNameRequest.getApproverInfo().getHodEmpNo());
    EdCentreHead edCentreHead = utility.findOrThrowNoSuchElementException("ED", EdCentreHead.class, domainNameRequest.getApproverInfo().getEdEmpNo());
    MemberNetops memberNetops = utility.findOrThrowNoSuchElementException("NETOPS", MemberNetops.class, domainNameRequest.getApproverInfo().getNetopsEmpNo());
    WebMaster webMaster = utility.findOrThrowNoSuchElementException("WEBMASTER", WebMaster.class, domainNameRequest.getApproverInfo().getWebmasterEmpNo());
    HodHpcIandE hodHpcIandE = utility.findOrThrowNoSuchElementException("HODHPC", HodHpcIandE.class, domainNameRequest.getApproverInfo().getHodHpcEmpNo());

    // Phase 3: Build the new entities that will be saved to the database.
    DomainVerification domainVerification = new DomainVerification();
    DomainName domainName = buildDomainName(domainNameRequest, drm, arm, hod, edCentreHead, memberNetops, webMaster, hodHpcIandE);
    Ip ip = buildIp(domainName, domainNameRequest);
    Vapt vapt = buildVapt(ip, domainNameRequest);
    domainVerification.setDomainName(domainName);

    // Phase 4: Persist all new entities.
    // CRITICAL FIX: The dangerous try-catch block is removed.
    // If any of these .save() calls fail, @Transactional will automatically roll back
    // all previous database operations within this method, ensuring data consistency.
    DomainName savedDomain = domainNameRepo.save(domainName);
    ipRepo.save(ip);
    vaptRepo.save(vapt);
    domainVerificationRepo.save(domainVerification);

    log.info("Successfully saved domain '{}' and its related entities to the database.", savedDomain.getDomainName());

    // Phase 5: Send notification asynchronously.
    // This happens after the database transaction is successful, without blocking the API response.
    sendApplicationSubmittedNotification(savedDomain);

    return new ResponseEntity<>(savedDomain, HttpStatus.CREATED);
  }

  /**
   * Helper method to encapsulate the synchronous Feign client calls.
   * A failure here will correctly cause the transaction to roll back.
   */
  private void updateExternalDrmAndArmInfo(DomainNameRequest request) {
    try {
      log.info("Updating external DRM info for empNo: {}", request.getDrmInfo().getEmpNo());
      client.updateDrmOrArmDetails(
              request.getDrmInfo().getEmpNo().toString(),
              buildUpdateDetails(request, Role.DRM)
      );

      log.info("Updating external ARM info for empNo: {}", request.getArmInfo().getEmpNo());
      client.updateDrmOrArmDetails(
              request.getArmInfo().getEmpNo().toString(),
              buildUpdateDetails(request, Role.ARM)
      );
    } catch (Exception e) {
      log.error("Critical failure during update of DRM/ARM info via Feign client. Rolling back transaction.", e);
      // Re-throw as a runtime exception to allow @Transactional to handle it.
      throw new RuntimeException("Failed to update external user information.", e);
    }
  }

  /**
   * Helper method to send the notification asynchronously using the async service.
   */
  private void sendApplicationSubmittedNotification(DomainName domainName) {
    String remarks = """
            DOMAIN NAME APPLICATION HAS BEEN SUCCESSFULLY SUBMITTED.
            PLEASE TRACK YOUR APPLICATION STATUS IN THE PORTAL.
            """;
    NotificationWebhook.EventType eventType = NotificationWebhook.EventType.DOMAIN_APPLICATION_SUBMITTED;
    NotificationWebhook payload = buildNotification(domainName, eventType, remarks);

    log.info("Queuing application submission notification for domain: {}", domainName.getDomainName());
    asyncNotificationService.sendNotificationAsync(webhookSecret, payload)
            .exceptionally(ex -> {
              log.error("Failed to send submission notification for domain: {}", domainName.getDomainName(), ex);
              return null; // Required for exceptionally block in CompletableFuture<Void>
            });
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

  private NotificationWebhook buildNotification(DomainName domainName,
                                                NotificationWebhook.EventType eventType,
                                                String remarks) {
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

  public ResponseEntity<String> updateDomain(@Positive Long dmId,
                                        @Valid UpdateDomainName updateDomainName) {
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

  public ResponseEntity<DomainResponse> getDomain(Long dmId) {
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
  public ResponseEntity<Page<ExpiringDomains>> getExpiringDomains(
          @Positive Long drmId,
          Pageable pageable,
          int expiringDays,
          boolean exact) {

    Page<DomainName> domainNamePage = null;

    if(!exact)
      domainNamePage = domainNameRepo.findByDrmId(drmId,
            pageable, expiringDays);
    else
      domainNamePage = domainNameRepo.findExpiringDomainsByDaysAndDrmId(drmId
              , pageable, expiringDays);

    if (!domainNamePage.hasContent())
      return new ResponseEntity<>(Page.empty(pageable), HttpStatus.OK);

    Page<ExpiringDomains> expiringDomainsPage =
            domainNamePage.map(domainName -> {
              ExpiringDomains expiringDomains = new ExpiringDomains();
              Arm arm = utility
                      .findOrThrowNoSuchElementException(
                              "ARM",
                              Arm.class,
                              domainName.getArmEmployeeNumber());
              expiringDomains.setDomainName(domainName.getDomainName());
              expiringDomains.setDomainId(domainName.getDomainNameId());
              expiringDomains.setArmName(arm.getFirstName() + " " + arm.getLastName());
              expiringDomains.setArmEmail(arm.getEmail());
              expiringDomains.setArmMobile(arm.getMobileNumber());
              expiringDomains.setExpiringDate(domainName.getExpiryDate().toLocalDate());
              expiringDomains.setArmEmpNo(domainName.getArmEmployeeNumber());
              return expiringDomains;
            });
      return new ResponseEntity<>(expiringDomainsPage, HttpStatus.OK);
  }

  @Transactional
  public ResponseEntity<DomainNameRenewalRequest> getDomainRenewal(@Positive Long domainId) {
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
  public ResponseEntity<Page<ExpiringDomains>> getAllDomains(Long empNo,
                                                             Role role,
                                                             Pageable pageable) {
    Page<DomainName> domainNameList = domainNameRepo.findAllByRoleAndId(empNo
            ,role.name(), pageable);
    if (domainNameList.isEmpty())
      return new ResponseEntity<>(Page.empty(pageable), HttpStatus.OK);

    //TO OPTIMIZE TELL RAJ TO EXPOSE A ENDPOINT FOR BULK USER DATA FETCH
    //ENDPOINT EXAMPLE POST /api/bulk/{Role} with request body as a list of
    // the emp numbers to be fetched
    Page<ExpiringDomains> expiringDomainsList =
            domainNameList.map(domainName -> {
              ExpiringDomains expiringDomains = new ExpiringDomains();
              Arm arm = utility
                      .findOrThrowNoSuchElementException(
                              "ARM",
                              Arm.class,
                              domainName.getArmEmployeeNumber());
              expiringDomains.setDomainName(domainName.getDomainName());
              expiringDomains.setDomainId(domainName.getDomainNameId());
              expiringDomains.setArmName(arm.getFirstName() + " " + arm.getLastName());
              expiringDomains.setArmEmail(arm.getEmail());
              expiringDomains.setArmMobile(arm.getMobileNumber());
              expiringDomains.setExpiringDate(domainName.getExpiryDate().toLocalDate());
              expiringDomains.setArmEmpNo(domainName.getArmEmployeeNumber());
              return expiringDomains;
            });
    return new ResponseEntity<>(expiringDomainsList, HttpStatus.OK);
  }

  @Transactional
  public ResponseEntity<Page<VerifyDomainRequestPageDto>> getDomainsWithByRoleAndEmpNoInfo(Long empNo,
                                                            Role role,
                                                            Pageable pageable) {

    Page<DomainNameDto> domainNameList = domainNameRepo.findAllDomainRequestsByRoleAndEmpNo(
                    empNo,
                    role.name(),
                    pageable
            );


    Page<VerifyDomainRequestPageDto> hodResponse =
            domainNameList.map(domainNameDto -> {
              VerifyDomainRequestPageDto domainRequest =
                      new VerifyDomainRequestPageDto();

              Drm drm = utility
                      .findOrThrowNoSuchElementException(
                              "DRM",
                              Drm.class,
                              domainNameDto.getDrmEmpNo());

              Arm arm = utility
                      .findOrThrowNoSuchElementException(
                              "ARM",
                              Arm.class,
                              domainNameDto.getArmEmpNo());

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

              domainRequest.setDomainId(domainNameDto.getDomainId());
              domainRequest.setDomainName(domainNameDto.getDomainName());
              domainRequest.setDrmName(
                      drm.getFirstName() + " " +
                              drm.getLastName());
              domainRequest.setArmName(
                      arm.getFirstName() + " " +
                              arm.getLastName()
              );

              domainRequest.setDateOfApplication(domainNameDto
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
              return domainRequest;


            });
    return new ResponseEntity<>(hodResponse,HttpStatus.OK);

  }

  @Transactional
  public ResponseEntity<DomainNameRenewalRequest> getDetailedDomain(@Positive Long domainId) {

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

  public ResponseEntity<Page<VerifyDomainRequestPageDto>> getRenewalViewByRoleAndEmpNo(
          Role role,
          Long empNo,
          Pageable pageable) {

    // domainId;
    // domainName;
    // drmName;
    // armName;
    // dateOfApplication;

    Page<DomainNameDto> domainNameList =
            domainNameRepo.findDomainRenewalsByRoleAndEmpNo(
                    role.name(),
                    empNo,
                    pageable);


    Page<VerifyDomainRequestPageDto> response =
            domainNameList.map(domainNameDto -> {
              VerifyDomainRequestPageDto domainRequest =
                      new VerifyDomainRequestPageDto();

              Drm drm = utility
                      .findOrThrowNoSuchElementException(
                              "DRM",
                              Drm.class,
                              domainNameDto.getDrmEmpNo());

              Arm arm = utility
                      .findOrThrowNoSuchElementException(
                              "ARM",
                              Arm.class,
                              domainNameDto.getArmEmpNo());

              domainRequest.setDomainId(domainNameDto.getDomainId());
              domainRequest.setDomainName(domainNameDto.getDomainName());
              domainRequest.setDrmName(
                      drm.getFirstName() + " " +
                              drm.getLastName());
              domainRequest.setArmName(
                      arm.getFirstName() + " " +
                              arm.getLastName()
              );

              domainRequest.setDateOfApplication(domainNameDto
                      .getDateOfApplication()
                      .toLocalDateTime()
                      .toLocalDate());
              return domainRequest;
            });
    return new ResponseEntity<>(response,HttpStatus.OK);
  }

  @Transactional
  public ResponseEntity<?> getTransferDetailsByHod(@Positive Long hodEmpNo, Pageable pageable) {

    RestPage<TransferRequestDto> transferRequestPage;
    try{
       transferRequestPage =
              renewalsClient.fetchTransferRecordsByRoleAndEmpNo(hodEmpNo,
                      Role.HOD, pageable);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

    log.debug("TRANSFER ={}", transferRequestPage);



    List<ViewTransferDto> responseList = new ArrayList<>();


    for(TransferRequestDto transfer: transferRequestPage) {
      log.info("transfer:{}", transfer);
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

    Page<ViewTransferDto> responsePage = new PageImpl<>(
            responseList,
            pageable,
            transferRequestPage.getTotalElements()
    );
    log.debug("RESPONSE PAGE={}", responsePage);


    return new ResponseEntity<>(responsePage, HttpStatus.OK);
  }

  public ResponseEntity<Page<ViewDomainResponseDto>> getAllViewDomains(Long empNo, Role role,
                                             Pageable pageable) {

    System.out.println(String.format("ROLE = %s, emp no = %d",role,empNo));
    Page<ViewDomainDBDto> viewDomainDBDtosPage =
            domainNameRepo.findAllDomainNameByRoleAndEmpNo(empNo, role.name()
                    , pageable);


    Page<ViewDomainResponseDto> domainResponseDtosPage =
            viewDomainDBDtosPage.map(viewDomainDBDto -> {

              String status;

              if(viewDomainDBDto.isActive())
                status = "Domain Active";
              else if(viewDomainDBDto.isDeleted())
                status = "Domain Deleted";
              else if (viewDomainDBDto.isRenewal())
                status = "Under Renewal";
              else if(viewDomainDBDto.getDomainExpiryDate() == null)
                status = "Application Submitted";
              else
                status = "Unknown Status";


              ViewDomainResponseDto responseDto = new ViewDomainResponseDto();

              Drm drm = utility.findOrThrowNoSuchElementException("DRM", Drm.class,
                      viewDomainDBDto.getDrmEmpNo());

              Centre drmCentre =
                      utility.findCentreOrThrowNoSuchElementException(Centre.class,
                              drm.getCentreId());

              GroupDepartment drmGroup =
                      utility.findGroupOrThrowNoSuchElementException(GroupDepartment.class,
                              drm.getGroupId());

              if(drm == null || drmCentre == null || drmGroup == null)
                throw new RuntimeException("drm or centre or group is null");
              System.out.println(drm.toString());

              responseDto.setDomainId(viewDomainDBDto.getDomainId());
              responseDto.setDomainName(viewDomainDBDto.getDomainName());
              responseDto.setDrmName(drm.getFirstName() + " " + drm.getLastName());

              if(viewDomainDBDto.getDomainExpiryDate() != null)
                responseDto.setDomainExpiryDate(viewDomainDBDto
                        .getDomainExpiryDate()
                        .toLocalDateTime()
                        .toLocalDate());
              responseDto.setDrmCentreName(drmCentre.getCentreName());
              responseDto.setDrmGroupName(drmGroup.getDepartmentName());
              responseDto.setStatus(status);
              return responseDto;
            });
    return new ResponseEntity<>(domainResponseDtosPage, HttpStatus.OK);
  }

  public ResponseEntity<Page<VerifyDomainRequestPageDto>> getDomainsToPurchase(Long webmasterId, Pageable pageable) {

    Page<DomainNameDto> domainNameList =
            domainNameRepo.findDomainToPurchaseByWebmasterId(webmasterId, pageable);


    Page<VerifyDomainRequestPageDto> response =
            domainNameList.map(domainNameDto -> {
              VerifyDomainRequestPageDto domainRequest =
                      new VerifyDomainRequestPageDto();

              Drm drm = utility
                      .findOrThrowNoSuchElementException(
                              "DRM",
                              Drm.class,
                              domainNameDto.getDrmEmpNo());

              Arm arm = utility
                      .findOrThrowNoSuchElementException(
                              "ARM",
                              Arm.class,
                              domainNameDto.getArmEmpNo());

              domainRequest.setDomainId(domainNameDto.getDomainId());
              domainRequest.setDomainName(domainNameDto.getDomainName());
              domainRequest.setDrmName(
                      drm.getFirstName() + " " +
                              drm.getLastName());
              domainRequest.setArmName(
                      arm.getFirstName() + " " +
                              arm.getLastName()
              );

              domainRequest.setDateOfApplication(domainNameDto
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
              return domainRequest;
            });
    return new ResponseEntity<>(response,HttpStatus.OK);

  }


  public ResponseEntity<PurchasePopulate> getDomainParticularsForViewPurchase(
          @Positive Long domainId) {
    return new ResponseEntity<PurchasePopulate>(
            domainNameRepo.getPurchasePopulateByDomainId(domainId), HttpStatus.OK);

  }

  @Transactional
  public ResponseEntity<DomainName> deleteDomain(Long domainId) {

    DomainName domainName = domainNameRepo
            .findByDomainNameId(domainId)
            .orElseThrow(() ->
                    new NoSuchElementException(
                            String.format("DOMAIN NAME " +
                                    "CORRESPONDING TO ID: %s DOES " +
                                    "NOT EXIST", domainId
                            )));

    domainName.setActive(false);
    domainName.setDeleted(true);
    DomainName  response = domainNameRepo.save(domainName);

    String remarks = """
            DOMAIN NAME  DELETION IS SUCCESSFUL.
            DOMAIN IS NO LONGER ACTIVE.
            """;
    NotificationWebhook.EventType eventType = NotificationWebhook
            .EventType
            .DOMAIN_DELETED;
    log.info("Queuing notification for deletion of domain: {}",
            response.getDomainName());
    asyncNotificationService
            .sendNotificationAsync(
                    webhookSecret,
                    buildNotification(response, eventType, remarks)
            )
            .exceptionally(throwable -> {
              log.error(
                      "Failed to send DELETION notification for domain: {}",
                      response.getDomainName(),
                      throwable
              );
              // The 'exceptionally' block must return a value. For CompletableFuture<Void>, null is appropriate.
              return null;
            });
    return ResponseEntity.ok(response);
  }
}


