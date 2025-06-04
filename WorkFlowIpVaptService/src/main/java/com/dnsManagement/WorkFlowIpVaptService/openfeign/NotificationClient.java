package com.dnsManagement.WorkFlowIpVaptService.openfeign;

import com.dnsManagement.WorkFlowIpVaptService.dto.NotificationWebhook;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "notification-service")
public interface NotificationClient {

  @PostMapping("/api/v1/notify/webhook")
  void sendNotification(@RequestHeader("X-Webhook-Secret") String token,
                        @RequestBody NotificationWebhook webhook);
}
