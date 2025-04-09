package com.dnsManagement.WorkFlowIpVaptService.openfeign;

import com.dnsManagement.WorkFlowIpVaptService.dto.NotificationWebhook;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationClient {

    @PostMapping("/api/v1/notify/webhook")
    public void sendNotification(@RequestBody NotificationWebhook webhook);
}
