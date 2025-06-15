package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.NotificationWebhook;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.NotificationClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class AsyncNotificationService {

  private static final Logger logger = LoggerFactory.getLogger(AsyncNotificationService.class);
  private final NotificationClient notificationClient;

  @Autowired
  public AsyncNotificationService(NotificationClient notificationClient) {
    this.notificationClient = notificationClient;
  }

  /**
   * Sends a notification asynchronously. This method will be executed in a separate thread
   * from Spring's task executor pool.
   *
   * @param webhookSecret The secret for the notification call.
   * @param payload The webhook payload to send.
   * @return A CompletableFuture that completes when the call is done. It will complete
   *         exceptionally if the notification call fails.
   */
  @Async
  public CompletableFuture<Void> sendNotificationAsync(String webhookSecret, NotificationWebhook payload) {
    try {
      String domainName = payload.getNotificationData().getDomainName(); // For logging
      logger.debug("Sending async notification for domain: {}", domainName);
      notificationClient.sendNotification(webhookSecret, payload);
      logger.debug("Successfully sent async notification for domain: {}", domainName);
      return CompletableFuture.completedFuture(null);
    } catch (Exception e) {
      // Propagate the exception through the future so the caller can handle it.
      return CompletableFuture.failedFuture(e);
    }
  }
}