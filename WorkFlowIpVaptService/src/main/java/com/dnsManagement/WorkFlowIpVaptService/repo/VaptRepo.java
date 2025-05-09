package com.dnsManagement.WorkFlowIpVaptService.repo;

import com.dnsManagement.WorkFlowIpVaptService.models.Vapt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VaptRepo extends JpaRepository<Vapt,Long> {

  @NativeQuery("select * from vapt where ip_id=:ipId")
  Optional<Vapt> findByIpId(Long ipId);
}
