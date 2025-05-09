package com.dnsManagement.WorkFlowIpVaptService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "com/dnsManagement/WorkFlowIpVaptService" +
        "/openfeign")
public class WorkFlowIpVaptServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(WorkFlowIpVaptServiceApplication.class, args);
  }

}
