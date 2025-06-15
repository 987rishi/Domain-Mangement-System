package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainNameRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DomainUpdateService {

  private static final Logger logger = LoggerFactory.getLogger(DomainUpdateService.class);
  private final DomainNameRepo domainRepository;

  @Autowired
  public DomainUpdateService(DomainNameRepo domainRepository) {
    this.domainRepository = domainRepository;
  }

  /**
   * Updates a list of domains in a single, atomic database transaction.
   * If any part of this operation fails, the entire transaction will be rolled back.
   *
   * @param domainsToUpdate The list of domain entities with updated states.
   * @param daysUntilExpiration The context for the log message.
   */
  @Transactional
  public void updateDomainsInTransaction(List<DomainName> domainsToUpdate, int daysUntilExpiration) {
    if (domainsToUpdate == null || domainsToUpdate.isEmpty()) {
      return;
    }
    logger.info("Attempting to save {} domain updates for the {} day interval in a single transaction.",
            domainsToUpdate.size(), daysUntilExpiration);
    domainRepository.saveAll(domainsToUpdate);
    logger.info("Successfully committed batch update for {} domains.", domainsToUpdate.size());
  }
}