package com.dnsManagement.WorkFlowIpVaptService.schedulers;

import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainNameRepo;
import com.dnsManagement.WorkFlowIpVaptService.services.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DomainExpirationScheduler {

  private static final Logger logger =
          LoggerFactory.getLogger(DomainExpirationScheduler.class);

  private final EmailService emailService;

  private final DomainNameRepo domainRepository;

  public DomainExpirationScheduler(EmailService emailService, DomainNameRepo domainRepository) {
    this.emailService = emailService;
    this.domainRepository = domainRepository;
  }

  @Scheduled(cron = "${scheduler.cron.expression}")
  @Transactional
  // Ensures that database updates (like lastNotificationSentForDays) are committed
  public void checkDomainExpirations() {
    logger.info("Starting domain expiration check...");

    LocalDate today = LocalDate.now();

    // Check for 60, 30, and 15 days
    checkAndNotifyForSpecificDays(today, 60);
    checkAndNotifyForSpecificDays(today, 30);
    checkAndNotifyForSpecificDays(today, 15);
    // You can add more intervals, e.g., 7 days, 1 day

    logger.info("Domain expiration check finished.");
  }

  private void checkAndNotifyForSpecificDays(LocalDate today, int daysUntilExpiration) {
    LocalDateTime targetExpirationDate = today.plusDays(daysUntilExpiration).atStartOfDay();
    logger.info("Checking for domains expiring in {} days (on {})...", daysUntilExpiration, targetExpirationDate);

    List<DomainName> expiringDomains =
            domainRepository.findByExpirationDateAndNotificationNeeded(
            targetExpirationDate,
            targetExpirationDate.plusDays(1),
            daysUntilExpiration
    );

    if (expiringDomains.isEmpty()) {
      logger.info("No domains found expiring in {} days that need notification.", daysUntilExpiration);
      return;
    }

    for (DomainName domain : expiringDomains) {
      logger.info("Domain {} (ID: {}) is expiring on {}. Sending notification.",
              domain.getDomainName(), domain.getDomainNameId(), domain.getExpiryDate());
      try {
        emailService.sendExpirationWarningEmail(domain, daysUntilExpiration);
        // Update the domain entity to mark that this notification has been sent
        domain.setLastNotificationDateSentForDays(daysUntilExpiration);
        domainRepository.save(domain); // Persist the change
        logger.info("Successfully sent notification and updated domain {} for {} day warning.", domain.getDomainName(), daysUntilExpiration);
      } catch (Exception e) {
        // Catching general exception here in case emailService itself throws something unexpected,
        // or if domainRepository.save fails. EmailService has its own try-catch for MailException.
        logger.error("Failed to process notification for domain {} for {} day warning: {}",
                domain.getDomainName(), daysUntilExpiration, e.getMessage(), e);
        // Decide if you want to stop processing or continue with other domains.
        // For now, it continues with the next domain.
      }
    }
    logger.info("Finished processing for {} day expiration warnings. Notified {} domains.",
            daysUntilExpiration, expiringDomains.size());
  }
}
