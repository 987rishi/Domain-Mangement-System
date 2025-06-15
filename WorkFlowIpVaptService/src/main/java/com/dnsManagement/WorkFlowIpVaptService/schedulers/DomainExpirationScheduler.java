package com.dnsManagement.WorkFlowIpVaptService.schedulers;

import com.dnsManagement.WorkFlowIpVaptService.dto.NotificationWebhook;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainNameRepo;
import com.dnsManagement.WorkFlowIpVaptService.services.AsyncNotificationService;
import com.dnsManagement.WorkFlowIpVaptService.services.DomainUpdateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * A scheduler that periodically checks for expiring domains and sends notifications.
 * This implementation is designed to be robust, performant, and transactionally safe.
 * It follows a Prepare -> Commit -> Notify pattern to ensure system consistency.
 */
@Component
public class DomainExpirationScheduler {

  // Centralized, constant message templates for consistency and easy maintenance.
  private static final String DOMAIN_EXPIRY_WARNING_TEMPLATE = """
            Dear User,
            This is a friendly reminder that your domain '%s' is due to expire in %d days, on %s.
            Please take the necessary steps to renew it to avoid any service interruption.
            Regards,
            Your Domain Management Team
            """;

  private static final String DOMAIN_EXPIRED_TEMPLATE = """
            Dear User,
            Your domain '%s' has expired today, on %s.
            Please take the necessary steps to renew it to avoid any service interruption.
            Regards,
            Your Domain Management Team
            """;

  @Value("${WEBHOOK_SECRET}")
  private String webhookSecret;

  private static final Logger logger = LoggerFactory.getLogger(DomainExpirationScheduler.class);

  private final DomainNameRepo domainRepository;
  private final DomainUpdateService domainUpdateService;
  private final AsyncNotificationService asyncNotificationService;

  /**
   * A private helper record to bundle a domain with its fully prepared notification payload.
   * This simplifies passing data between processing phases.
   */
  private record NotificationTask(DomainName domain, NotificationWebhook payload) {}

  @Autowired
  public DomainExpirationScheduler(DomainNameRepo domainRepository, DomainUpdateService domainUpdateService, AsyncNotificationService asyncNotificationService) {
    this.domainRepository = domainRepository;
    this.domainUpdateService = domainUpdateService;
    this.asyncNotificationService = asyncNotificationService;
  }

  /**
   * The main entry point for the scheduled job. It orchestrates checks for various time intervals.
   */
  @Scheduled(cron = "${scheduler.cron.expression}")
  public void checkDomainExpirations() {
    logger.info("Starting domain expiration check scheduler...");
    LocalDate today = LocalDate.now();

    checkAndNotifyForSpecificDays(today, 60);
    checkAndNotifyForSpecificDays(today, 30);
    checkAndNotifyForSpecificDays(today, 15);
    checkAndNotifyForSpecificDays(today, 0); // Handles expired domains

    logger.info("Domain expiration check scheduler finished.");
  }

  /**
   * Core logic for a single expiration interval (e.g., 60 days).
   * This method fetches domains, prepares all data in memory, commits the DB changes in a
   * single transaction, and only then dispatches notifications asynchronously.
   *
   * @param today The current date.
   * @param daysUntilExpiration The interval to check.
   */
  private void checkAndNotifyForSpecificDays(LocalDate today, int daysUntilExpiration) {
    LocalDateTime start = today.plusDays(daysUntilExpiration).atStartOfDay();
    LocalDateTime end = start.plusDays(1);
    logger.info("Checking for domains expiring in {} days (on date: {})...", daysUntilExpiration, start.toLocalDate());

    List<DomainName> expiringDomains = domainRepository.findByExpirationDateAndNotificationNeeded(start, end, daysUntilExpiration);
    if (expiringDomains.isEmpty()) {
      logger.info("No domains found for {} day interval that need notification.", daysUntilExpiration);
      return;
    }

    // --- PHASE 1: PREPARE all tasks in memory (Non-Transactional) ---
    List<NotificationTask> notificationTasks = new ArrayList<>();
    for (DomainName domain : expiringDomains) {
      final boolean isExpired = (daysUntilExpiration == 0);
      if (isExpired) {
        domain.setActive(false);
      }
      domain.setLastNotificationDateSentForDays(daysUntilExpiration);

      NotificationWebhook payload = buildWebhookPayload(domain, daysUntilExpiration, isExpired);
      notificationTasks.add(new NotificationTask(domain, payload));
    }

    // --- PHASE 2: COMMIT database changes (Transactional) ---
    List<DomainName> domainsToUpdate = notificationTasks.stream().map(NotificationTask::domain).toList();
    try {
      domainUpdateService.updateDomainsInTransaction(domainsToUpdate, daysUntilExpiration);
    } catch (Exception e) {
      logger.error("CRITICAL: Database transaction failed for {} day interval. Rollback initiated. No notifications will be sent.",
              daysUntilExpiration, e);
      return; // Stop processing for this interval to maintain consistency.
    }

    // --- PHASE 3: DISPATCH all notifications asynchronously ---
    logger.info("Database commit successful. Proceeding to dispatch {} notifications asynchronously.", notificationTasks.size());
    Map<CompletableFuture<Void>, DomainName> futureToDomainMap = notificationTasks.stream()
            .collect(Collectors.toMap(
                    task -> asyncNotificationService.sendNotificationAsync(webhookSecret, task.payload()),
                    NotificationTask::domain
            ));

    // Wait for all async calls to complete before summarizing results
    // .join is the blocking part which halts the thread until the async ops
    // are completed
    CompletableFuture.allOf(futureToDomainMap.keySet().toArray(new CompletableFuture[0])).join();

    // --- PHASE 4: SUMMARIZE results ---
    Map<DomainName, Exception> failedNotifications = new HashMap<>();
    futureToDomainMap.forEach((future, domain) -> {
      if (future.isCompletedExceptionally()) {
        try {
          future.get();
        } catch (InterruptedException | ExecutionException e) {
          failedNotifications.put(domain, e.getCause() != null ? (Exception) e.getCause() : e);
          Thread.currentThread().interrupt();
        }
      }
    });

    logSummary(daysUntilExpiration, expiringDomains.size(), failedNotifications);
  }

  /**
   * Constructs the NotificationWebhook DTO with all required nested objects and fields.
   */
  private NotificationWebhook buildWebhookPayload(DomainName domain, int daysUntilExpiration, boolean isExpired) {
    final NotificationWebhook.EventType eventType;
    final String remarks;

    if (isExpired) {
      eventType = NotificationWebhook.EventType.DOMAIN_EXPIRED;
      remarks = String.format(DOMAIN_EXPIRED_TEMPLATE,
              domain.getDomainName(), domain.getExpiryDate().toLocalDate().toString());
    } else {
      eventType = NotificationWebhook.EventType.DOMAIN_EXPIRY_WARNING;
      remarks = String.format(DOMAIN_EXPIRY_WARNING_TEMPLATE,
              domain.getDomainName(), daysUntilExpiration, domain.getExpiryDate().toLocalDate().toString());
    }

    var triggeredBy = new NotificationWebhook.TriggeredBy(
            domain.getDrmEmployeeNumber(),
            Role.DRM // Assuming DRM is the system role triggering this event.
    );

    var notificationData = new NotificationWebhook.NotificationData(
            domain.getDomainNameId(),
            domain.getDomainName(),
            remarks
    );

    var recipients = new NotificationWebhook.Recipients(
            domain.getDrmEmployeeNumber(),
            domain.getArmEmployeeNumber(),
            null, null, null, null, null // Other roles are not relevant for this notification
    );

    return new NotificationWebhook(
            eventType,
            LocalDateTime.now(),
            triggeredBy,
            notificationData,
            recipients
    );
  }

  /**
   * Logs a clear, final summary of the processing results for an interval.
   */
  private void logSummary(int days, int total, Map<DomainName, Exception> failures) {
    int successCount = total - failures.size();
    logger.info("Finished processing for {} day interval. Total domains: {}. Succeeded: {}. Failed: {}.",
            days, total, successCount, failures.size());

    if (!failures.isEmpty()) {
      logger.warn("The following notifications failed to send (database state was already updated successfully):");
      failures.forEach((domain, ex) ->
              logger.warn(" - Domain: {} (ID: {}), Reason: {}", domain.getDomainName(), domain.getDomainNameId(), ex.getMessage())
      );
    }
  }
}