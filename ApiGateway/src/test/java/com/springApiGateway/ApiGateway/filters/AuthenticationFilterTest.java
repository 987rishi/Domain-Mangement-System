
package com.springApiGateway.ApiGateway.filters;

import com.springApiGateway.ApiGateway.exceptions.UnauthorizedAccessException;
import com.springApiGateway.ApiGateway.service.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.function.Predicate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationFilterTest {

  @Mock
  private RouteValidator routeValidator;

  @Mock
  private JwtUtils jwtUtils;

  @Mock
  private GatewayFilterChain filterChain;

  @InjectMocks
  private AuthenticationFilter authenticationFilter;

  private AuthenticationFilter.Config config;

  @BeforeEach
  void setUp() {
    routeValidator.isSecured = mock(Predicate.class);
    config = new AuthenticationFilter.Config();
  }

  @Test
  @DisplayName("Should pass through when route is not secured")
  void apply_whenRouteIsNotSecured_shouldPassThroughChain() {
    // Arrange
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/public/some-endpoint").build();
    ServerWebExchange exchange = MockServerWebExchange.from(request);

    when(routeValidator.isSecured.test(request)).thenReturn(false);
    when(filterChain.filter(exchange)).thenReturn(Mono.empty());
    GatewayFilter filter = authenticationFilter.apply(config);

    // Act
    Mono<Void> result = filter.filter(exchange, filterChain);

    // Assert
    StepVerifier.create(result).verifyComplete();
    verify(filterChain, times(1)).filter(exchange);
    verifyNoInteractions(jwtUtils);
  }

  @Test
  @DisplayName("Should pass through when route is secured and token is valid")
  void apply_whenRouteIsSecuredAndTokenIsValid_shouldPassThroughChain() {
    // Arrange
    final String validToken = "valid-jwt-token";
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/private/user-details")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
            .build();
    ServerWebExchange exchange = MockServerWebExchange.from(request);

    when(routeValidator.isSecured.test(request)).thenReturn(true);
    doNothing().when(jwtUtils).validateToken(validToken);
    when(filterChain.filter(exchange)).thenReturn(Mono.empty());
    GatewayFilter filter = authenticationFilter.apply(config);

    // Act
    Mono<Void> result = filter.filter(exchange, filterChain);

    // Assert
    StepVerifier.create(result).verifyComplete();
    verify(jwtUtils, times(1)).validateToken(validToken);
    verify(filterChain, times(1)).filter(exchange);
  }

  @Test
  @DisplayName("Should return 401 Unauthorized when Authorization header is missing")
  void apply_whenAuthHeaderIsMissing_shouldReturnUnauthorized() {
    // Arrange
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/private/user-details").build();
    ServerWebExchange exchange = MockServerWebExchange.from(request);

    when(routeValidator.isSecured.test(request)).thenReturn(true);
    GatewayFilter filter = authenticationFilter.apply(config);

    // Act
    Mono<Void> result = filter.filter(exchange, filterChain);

    // Assert
    StepVerifier.create(result).verifyComplete(); // The response is written, so the Mono completes.
    assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    verifyNoInteractions(filterChain);
    verifyNoInteractions(jwtUtils);
  }

  @Test
  @DisplayName("Should propagate UnauthorizedAccessException when token is invalid")
  void apply_whenTokenIsInvalid_shouldPropagateError() {
    // Arrange
    final String invalidToken = "invalid-jwt-token";
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/private/user-details")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + invalidToken)
            .build();
    ServerWebExchange exchange = MockServerWebExchange.from(request);

    when(routeValidator.isSecured.test(request)).thenReturn(true);
    doThrow(new RuntimeException("Token has expired")).when(jwtUtils).validateToken(invalidToken);
    GatewayFilter filter = authenticationFilter.apply(config);

    // Act
    Mono<Void> result = filter.filter(exchange, filterChain);

    // Assert
    final String expectedErrorMessage = "Unauthorized access attempt for route: " + request.getURI();

    StepVerifier.create(result)
            .expectErrorSatisfies(throwable -> {
              assertInstanceOf(UnauthorizedAccessException.class, throwable, "Exception should be the custom UnauthorizedAccessException");
              assertEquals(expectedErrorMessage, throwable.getMessage());
              assertNotNull(throwable.getCause(), "The original exception should be preserved as the cause");
              assertEquals("Token has expired", throwable.getCause().getMessage());
            })
            .verify();

    verify(jwtUtils, times(1)).validateToken(invalidToken);
    verifyNoInteractions(filterChain);
  }
}
