package com.dnsManagement.WorkFlowIpVaptService.repo;

import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DomainNameRepo extends JpaRepository<DomainName,Long> {
}
