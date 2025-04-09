package com.dnsManagement.WorkFlowIpVaptService.repo;

import com.dnsManagement.WorkFlowIpVaptService.models.DomainVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DomainVerificationRepo extends JpaRepository<DomainVerification,Long> {

    @NativeQuery("select * from domain_verification where dm_id=:domainNameId")
    Optional<DomainVerification> findByDomainNameId(Long domainNameId);

}
