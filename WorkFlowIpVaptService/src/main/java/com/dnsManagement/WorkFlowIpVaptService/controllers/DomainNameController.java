package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.dto.*;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.services.DomainNameService;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for handling all HTTP requests related to domain information.
 * <p>
 * This controller exposes endpoints for retrieving domain lists, viewing details,
 * and fetching information related to domain renewal, transfer, and purchase workflows.
 * It delegates all business logic to the {@link DomainNameService}.
 * All endpoints are mapped under the base path {@code /domain}.
 * </p>
 *
 * @see com.dnsManagement.WorkFlowIpVaptService.services.DomainNameService
 */
@RestController
@RequestMapping("/domain")
public class DomainNameController {

  private boolean exact;


  private final DomainNameService domainNameService;

  @Autowired
  public DomainNameController(DomainNameService domainNameService) {
    this.domainNameService = domainNameService;
  }

  /**
   * Retrieves a paginated list of expiring domains associated with a specific DRM ID.
   * <p>
   * This endpoint handles GET requests to {@code /domain/list/renew/{drmId}}.
   * </p>
   *
   * @param drmId The unique identifier of the DRM (Domain Relationship Manager). Must be a positive number.
   * @param pageable Pagination information (e.g., page number, size, sort order) provided by Spring.
   * @return A {@link ResponseEntity} containing a {@link Page} of {@link ExpiringDomains}.
   */
  @GetMapping("list/renew/{drmId}")
  public ResponseEntity<Page<ExpiringDomains>> getDomainsById(@PathVariable @Positive Long drmId,
                                                              Pageable pageable) {
    int expiringDays = 60;
    exact = false;
    return domainNameService.getExpiringDomains(drmId, pageable, expiringDays
            , exact);
  }



  @GetMapping("expiring-domains/{days}/{drmId}")
  public ResponseEntity<Page<ExpiringDomains>> getExpiringDomainsByDays(@PathVariable @Positive Long drmId,
                                                              Pageable pageable,
                                                              @PathVariable Integer days) {
    exact = true;
    return domainNameService.getExpiringDomains(drmId, pageable, days, exact);
  }

  @GetMapping("purchase/domain/{domainId}")
  public ResponseEntity<PurchasePopulate> getDomainDetailsForPurchase(
          @PathVariable
          @Positive Long domainId) {
    return domainNameService.getDomainParticularsForViewPurchase(domainId);
  }

  /**
   * Fetches the details of a specific domain for renewal purposes.
   * <p>
   * This endpoint handles GET requests to {@code /domain/get/renew/{domainId}}.
   * </p>
   *
   * @param domainId The unique identifier of the domain to be renewed. Must be a positive number.
   * @return A {@link ResponseEntity} containing the domain's renewal information. The exact body type
   *         is determined by the service layer.
   */
  @GetMapping("get/renew/{domainId}")
  public ResponseEntity<DomainNameRenewalRequest> getDomainByDomainId(@PathVariable @Positive Long domainId) {
    return domainNameService.getDomainRenewal(domainId);
  }


  @DeleteMapping("delete/{domainId}")
  public ResponseEntity<DomainName> deleteDomain(@PathVariable Long domainId) {
    return domainNameService.deleteDomain(domainId);
  }

  /**
   * Retrieves all domains associated with a specific employee and their role.
   * <p>
   * This endpoint handles GET requests to {@code /domain/get-domains/{role}/{empNo}}.
   * </p>
   *
   * @param empNo The employee number.
   * @param role  The role of the employee (e.g., HOD, ARM), which defines the access scope.
   * @return A {@link ResponseEntity} containing a page of domains.
   */
  @GetMapping("get-domains/{role}/{empNo}")
  public ResponseEntity<Page<ExpiringDomains>> getDomains(@PathVariable Long empNo,
                                      @PathVariable Role role,
                                      Pageable pageable) {
    return domainNameService.getAllDomains(empNo, role, pageable);
  }

  /**
   * Provides a paginated view of all domains accessible to a specific employee based on their role.
   * <p>
   * This endpoint handles GET requests to {@code /domain/view-domains/{role}/{empNo}}.
   * </p>
   *
   * @param empNo    The employee number.
   * @param role     The role of the employee, used for filtering domains.
   * @param pageable Pagination information for the result set.
   * @return A {@link ResponseEntity} containing a {@link Page} of {@link ViewDomainResponseDto} objects.
   */
  @GetMapping("view-domains/{role}/{empNo}")
  public ResponseEntity<Page<ViewDomainResponseDto>> getViewDomains(@PathVariable("empNo") Long empNo,
                                                                    @PathVariable("role") Role role,
                                                                    Pageable pageable) {
    return domainNameService.getAllViewDomains(empNo, role, pageable);
  }

  /**
   * Fetches domain verification requests assigned to a specific employee based on their role.
   * <p>
   * This endpoint handles GET requests to {@code /domain/{role}/domain-verify-requests/{hodEmpNo}}.
   * </p>
   *
   * @param hodEmpNo The employee number of the user (e.g., an HOD) whose requests are to be fetched.
   * @param role     The role of the user, which determines the scope of the search.
   * @return A {@link ResponseEntity} with the list of domain verification requests.
   */
//  -- TO DO POSTMAN TESTING
  @GetMapping("{role}/domain-verify-requests/{hodEmpNo}")
  public ResponseEntity<Page<VerifyDomainRequestPageDto>> getDomainVerifyAndInfoByRoleAndEmpNo(@PathVariable Long hodEmpNo,
                                                                                               @PathVariable Role role,
                                                                                               Pageable pageable) {
    return domainNameService.getDomainsWithByRoleAndEmpNoInfo(
            hodEmpNo,
            role,
            pageable);
  }

  /**
   * Retrieves a comprehensive, detailed view of a single domain by its ID.
   * <p>
   * This endpoint handles GET requests to {@code /domain/domain-detail/{domainId}}.
   * </p>
   *
   * @param domainId The unique ID of the domain to be fetched. Must be a positive number.
   * @return A {@link ResponseEntity} containing the detailed domain object.
   */
  @GetMapping("domain-detail/{domainId}")
  public ResponseEntity<DomainNameRenewalRequest> getDetailedDomain(@PathVariable @Positive Long domainId) {
    return domainNameService.getDetailedDomain(domainId);
  }

  /**
   * Fetches the renewal view for domains associated with a given employee and role.
   * <p>
   * This endpoint handles GET requests to {@code /domain/domain-renewal/view/{role}/{empNo}}.
   * </p>
   *
   * @param role  The role of the employee.
   * @param empNo The employee number.
   * @return A {@link ResponseEntity} containing the renewal view information.
   */
//  -- TO DO POSTMAN TESTING
  @GetMapping("domain-renewal/view/{role}/{empNo}")
  public ResponseEntity<Page<VerifyDomainRequestPageDto>> getRenewalsView(@PathVariable Role role,
                                           @PathVariable Long empNo,
                                           Pageable pageable) {
    return domainNameService.getRenewalViewByRoleAndEmpNo(
            role,
            empNo,
            pageable);
  }

  /**
   * Retrieves all domain transfer requests pending for a specific HOD (Head of Department).
   * <p>
   * This endpoint handles GET requests to {@code /domain/view/transfer/hod/{hodEmpNo}}.
   * </p>
   *
   * @param hodEmpNo The employee number of the HOD. Must be a positive number.
   * @return A {@link ResponseEntity} containing the list of transfer requests.
   */
//  -- HANSRAJ MS CALL
  @GetMapping("/view/transfer/hod/{hodEmpNo}")
  public ResponseEntity<?> getTransferRequestsByHod(@PathVariable @Positive Long hodEmpNo,
                                                    Pageable pageable)
  {
    return domainNameService.getTransferDetailsByHod(hodEmpNo, pageable);
  }

  /**
   * Fetches a list of domains that are ready for purchase, intended for the WEBMASTER view.
   * <p>
   * This endpoint handles GET requests to {@code /domain/domain-purchase-view/WEBMASTER/{webmasterId}}.
   * </p>
   *
   * @param webmasterId The unique identifier of the webmaster.
   * @return A {@link ResponseEntity} containing the list of domains to be purchased.
   */
//  -- TO DO POSTMAN TESTING
  @GetMapping("domain-purchase-view/WEBMASTER/{webmasterId}")
  public ResponseEntity<Page<VerifyDomainRequestPageDto>> getDomainsForPurchase(@PathVariable Long webmasterId,
                                                 Pageable pageable) {
    return domainNameService.getDomainsToPurchase(webmasterId, pageable);
  }
}