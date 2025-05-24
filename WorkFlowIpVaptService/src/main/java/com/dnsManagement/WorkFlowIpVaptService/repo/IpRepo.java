package com.dnsManagement.WorkFlowIpVaptService.repo;

import com.dnsManagement.WorkFlowIpVaptService.models.Ip;
import jakarta.validation.constraints.Positive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IpRepo extends JpaRepository<Ip,Integer> {
  @NativeQuery("select * from ip where ip_id=:ipId")
  Optional<Ip> findByIpId(@Positive Long ipId);

  @NativeQuery("select * from ip where dm_id=:dmId")
  Optional<Ip> findByDomainId(Long dmId);
}
