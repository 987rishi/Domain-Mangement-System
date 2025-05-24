package com.springApiGateway.ApiGateway.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Response {
  @NotNull
  private Boolean success;

  @NotNull
  private String message;

  @NotNull
  private String token;
  @NotNull
  private AppUser user;

}
