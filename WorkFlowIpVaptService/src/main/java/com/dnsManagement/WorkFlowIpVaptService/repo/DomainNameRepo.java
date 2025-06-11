package com.dnsManagement.WorkFlowIpVaptService.repo;

import com.dnsManagement.WorkFlowIpVaptService.dto.DomainNameDto;
import com.dnsManagement.WorkFlowIpVaptService.dto.ViewDomainDBDto;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.dto.PurchasePopulate;
import jakarta.validation.constraints.Positive;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DomainNameRepo extends JpaRepository<DomainName, Long> {
//  SELECT *
//  FROM domains
//  WHERE expiry_date BETWEEN NOW() AND NOW() + INTERVAL '60 days';
//  dm_id,dm_name,arm_emp_no,expiry_date


  @NativeQuery("select * from domain_name " +
          "where drm_emp_no=:drmId and " +
          "expiry_date between NOW() and NOW() + INTERVAL '60 days' and " +
          "is_renewal=false")
  Page<DomainName> findByDrmId(@Positive @Param("drmId")
                               Long drmId,
                               Pageable pageable,
                               @Param("expiringDays")
                               int expiringDays);

  @Query(value = """
          SELECT dn.dm_id AS domainId,
                 dm_name AS domainName,
                 drm_emp_no AS drmEmpNo,
                 expiry_date AS domainExpiryDate,
                 is_active AS isActive,
                 is_renewal AS isRenewal,
                 is_del AS isDeleted
          FROM domain_name dn
          JOIN domain_verification dv ON dv.dm_id = dn.dm_id
            AND (
                (:role = 'DRM' AND dn.drm_emp_no = :empNo) OR
                (:role = 'ARM' AND dn.arm_emp_no = :empNo) OR
                (:role = 'HOD' AND dn.hod_emp_no = :empNo) OR
                (:role = 'ED' AND dn.ed_emp_no = :empNo ) OR
                (:role = 'NETOPS' AND dn.netops_emp_no = :empNo ) OR
                (:role = 'WEBMASTER' AND dn.webmaster_emp_no = :empNo ) OR
                (:role = 'HODHPC' AND dn.hod_hpc_emp_no = :empNo )
            )
          """, nativeQuery = true)
  Page<ViewDomainDBDto> findAllDomainNameByRoleAndEmpNo(Long empNo,
                                                        String role,
                                                        Pageable pageable);

  @NativeQuery("select dn.dm_id as domainId,dm_name as domainName,drm_emp_no " +
          "as " +
          "drmEmpNo " +
          ",arm_emp_no as armEmpNo,d_o_apl as dateOfApplication " +
          "from " +
          "domain_name " +
          "dn," +
          "domain_verification dv where " +
          "dn.hod_emp_no=:hodEmpNo and dv.dm_id=dn.dm_id and dv.fwd_arm=true " +
          "and dv.vfyd_by_hod=false")
  List<DomainNameDto> findAllByHodEmpNo(Long hodEmpNo);

  Optional<DomainName> findByDomainNameId(@Positive Long domainId);


  @Query(value = """
          SELECT dn.dm_id AS domainId,
                 dm_name AS domainName,
                 drm_emp_no AS drmEmpNo,
                 arm_emp_no AS armEmpNo,
                 d_o_apl AS dateOfApplication
          FROM domain_name dn
          JOIN domain_verification dv ON dv.dm_id = dn.dm_id
          WHERE dn.is_renewal = true
            AND (
            
                (:role = 'ARM' AND dn.arm_emp_no = :empNo AND dv.fwd_arm = false) OR
                (:role = 'HOD' AND dn.hod_emp_no = :empNo AND dv.vfyd_by_hod = false AND dv.fwd_arm = true) OR
                (:role = 'ED' AND dn.ed_emp_no = :empNo AND dv.vfy_by_ed = false AND dv.vfyd_by_hod = true) OR
                (:role = 'NETOPS' AND dn.netops_emp_no = :empNo AND dv.vfy_by_netops = false AND dv.vfy_by_ed = true) OR
                (:role = 'WEBMASTER' AND dn.webmaster_emp_no = :empNo AND dv.vfy_by_wbmstr = false AND dv.vfy_by_netops = true) OR
                (:role = 'HODHPC' AND dn.hod_hpc_emp_no = :empNo AND dv.vfy_by_hod_hpc_iand_e = false AND dv.vfy_by_wbmstr = true)
            )
          """, nativeQuery = true)
  List<DomainNameDto> findDomainRenewalsByRoleAndEmpNo(
          @Param("role") String role,
          @Param("empNo") Long empNo);



  @Query(value = """
          SELECT dn.dm_id AS domainId,
                 dm_name AS domainName,
                 drm_emp_no AS drmEmpNo,
                 arm_emp_no AS armEmpNo,
                 d_o_apl AS dateOfApplication
          FROM domain_name dn
          JOIN domain_verification dv ON dv.dm_id = dn.dm_id
          WHERE dn.is_renewal = false 
          AND dn.is_active = false 
            AND (
            (:role = 'ARM' AND dn.arm_emp_no = :empNo AND dv.fwd_arm = false) OR
                (:role = 'HOD' AND dn.hod_emp_no = :empNo AND dv.vfyd_by_hod = false AND dv.fwd_arm = true) OR
                (:role = 'ED' AND dn.ed_emp_no = :empNo AND dv.vfy_by_ed = false AND dv.vfyd_by_hod = true) OR
                (:role = 'NETOPS' AND dn.netops_emp_no = :empNo AND dv.vfy_by_netops = false AND dv.vfy_by_ed = true) OR
                (:role = 'WEBMASTER' AND dn.webmaster_emp_no = :empNo AND dv.vfy_by_wbmstr = false AND dv.vfy_by_netops = true) OR
                (:role = 'HODHPC' AND dn.hod_hpc_emp_no = :empNo AND dv.vfy_by_hod_hpc_iand_e = false AND dv.vfy_by_wbmstr = true)
            )
          """, nativeQuery = true)
  List<DomainNameDto> findAllDomainRequestsByRoleAndEmpNo(Long empNo,
                                                          String role);





  //USED BY TRANSFER_DELETE PAGE VIEW
  @Query(value = """
          SELECT dn.*
          FROM domain_name dn
          WHERE dn.is_renewal = false 
          AND dn.is_active = true
            AND (
                (:role = 'DRM' AND dn.drm_emp_no = :empNo ) OR
                (:role = 'ARM' AND dn.arm_emp_no = :empNo ) OR
            
                (:role = 'HOD' AND dn.hod_emp_no = :empNo ) OR
                (:role = 'ED' AND dn.ed_emp_no = :empNo ) OR
                (:role = 'NETOPS' AND dn.netops_emp_no = :empNo ) OR
                (:role = 'WEBMASTER' AND dn.webmaster_emp_no = :empNo ) OR
                (:role = 'HODHPC' AND dn.hod_hpc_emp_no = :empNo )
            )
          """, nativeQuery = true)
  List<DomainName> findAllByRoleAndId(@Param("empNo") Long empNo,
                                      @Param("role") String role);






  @Query(value = """
          SELECT dn.dm_id AS domainId,
                 dm_name AS domainName,
                 drm_emp_no AS drmEmpNo,
                 arm_emp_no AS armEmpNo,
                 d_o_apl AS dateOfApplication
          FROM domain_name dn
          JOIN domain_verification dv ON dv.dm_id = dn.dm_id
          WHERE dv.is_verified = true 
          AND (dn.is_active = false OR dn.is_renewal = true) 
            AND 
          (dn.webmaster_emp_no = :webmasterId) 
          """, nativeQuery = true)
  List<DomainNameDto> findDomainToPurchaseByWebmasterId(Long webmasterId);


  @Query("SELECT dn from DomainName dn WHERE dn.expiryDate IS NOT NULL AND dn" +
          ".expiryDate >= :targetExpirationDateStart AND " +
          "dn.expiryDate < :targetExpirationDateEnd AND " +
          "(dn.lastNotificationDateSentForDays IS NULL OR dn" +
          ".lastNotificationDateSentForDays>:daysUntilExpiration)")
  List<DomainName> findByExpirationDateAndNotificationNeeded(
          LocalDateTime targetExpirationDateStart,
          LocalDateTime targetExpirationDateEnd,
          int daysUntilExpiration);



  @NativeQuery("SELECT * FROM domain_name " +
          "WHERE drm_emp_no = :drmId " +
          "AND CAST(expiry_date AS date) = (CURRENT_DATE + :expiringDays) " + //
          // Corrected logic for PostgreSQL
          "AND is_renewal = false")
  Page<DomainName> findExpiringDomainsByDaysAndDrmId(@Positive Long drmId, Pageable pageable, int expiringDays);


  @Query("SELECT new com.dnsManagement.WorkFlowIpVaptService.dto.PurchasePopulate(dm.isRenewal, dm.periodInYears) " +
          "FROM DomainName dm " +
          "WHERE dm.domainNameId = :domainId")
  PurchasePopulate getPurchasePopulateByDomainId(@Param("domainId") @Positive Long domainId);
}

