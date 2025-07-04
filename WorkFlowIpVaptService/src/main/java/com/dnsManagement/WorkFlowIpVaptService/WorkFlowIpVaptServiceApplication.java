package com.dnsManagement.WorkFlowIpVaptService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients(basePackages = "com/dnsManagement/WorkFlowIpVaptService" +
        "/openfeign")
@EnableScheduling
@EnableAsync
public class WorkFlowIpVaptServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(WorkFlowIpVaptServiceApplication.class, args);
  }

}
