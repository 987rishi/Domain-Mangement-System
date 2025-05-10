package com.springApiGateway.ApiGateway.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppUser {
    @JsonProperty("uidNumber")
    private String id;
    @JsonProperty("employeeEmail")
    private String email;
    @JsonProperty("fullName")
    private String name;
    @JsonProperty("role")
    private String role;
    @JsonProperty("message")
    private String message;
}

