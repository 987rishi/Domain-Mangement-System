package com.dnsManagement.WorkFlowIpVaptService.repo;

import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainRenewal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DomainRenewalRepo extends JpaRepository<DomainRenewal,Long> {
    @NativeQuery("select * from domain_renewal where dm_id=:dmId")
    Optional<DomainRenewal> findByDomainId(Long dmId);
}
