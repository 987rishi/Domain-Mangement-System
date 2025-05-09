package com.dnsManagement.WorkFlowIpVaptService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IpResponse {

  @NotNull
  @JsonProperty("ip_id")
  private Long ipId;

  @NotNull
  @JsonProperty("ip_address")
  private String ipAddress;

  @NotNull
  @JsonProperty("ip_issuer")
  private String ipIssuer;

  @NotNull
  @JsonProperty("expiry_date")
  private LocalDateTime expiryDate;

  @NotNull
  @JsonProperty("dm_id")
  private Long domainNameId;

  @NotNull
  @JsonProperty("is_active")
  private boolean isActive;
}
