package com.springApiGateway.ApiGateway.filters;

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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
    // Create a mock predicate for the RouteValidator
    // This is necessary because isSecured is a public field, not a method.
    routeValidator.isSecured = mock(Predicate.class);
    config = new AuthenticationFilter.Config();
  }

  @Test
  @DisplayName("Should pass through when route is not secured")
  void apply_whenRouteIsNotSecured_shouldPassThroughChain() {
    // Arrange
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/public/some-endpoint").build();
    ServerWebExchange exchange = MockServerWebExchange.from(request);

    // Mock behavior: Route is not secured
    when(routeValidator.isSecured.test(request)).thenReturn(false);
    // Mock behavior: Filter chain continues successfully
    when(filterChain.filter(exchange)).thenReturn(Mono.empty());

    GatewayFilter filter = authenticationFilter.apply(config);

    // Act
    Mono<Void> result = filter.filter(exchange, filterChain);

    // Assert
    StepVerifier.create(result)
            .verifyComplete();

    verify(filterChain, times(1)).filter(exchange);
    verifyNoInteractions(jwtUtils); // JWT validation should not be called
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

    // Mock behavior: Route is secured
    when(routeValidator.isSecured.test(request)).thenReturn(true);
    // Mock behavior: Token validation succeeds (does not throw exception)
    doNothing().when(jwtUtils).validateToken(validToken);
    // Mock behavior: Filter chain continues successfully
    when(filterChain.filter(exchange)).thenReturn(Mono.empty());

    GatewayFilter filter = authenticationFilter.apply(config);

    // Act
    Mono<Void> result = filter.filter(exchange, filterChain);

    // Assert
    StepVerifier.create(result)
            .verifyComplete();

    verify(jwtUtils, times(1)).validateToken(validToken);
    verify(filterChain, times(1)).filter(exchange);
  }

  @Test
  @DisplayName("Should return 401 Unauthorized when Authorization header is missing")
  void apply_whenAuthHeaderIsMissing_shouldReturnUnauthorized() {
    // Arrange
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/private/user-details").build();
    ServerWebExchange exchange = MockServerWebExchange.from(request);

    // Mock behavior: Route is secured
    when(routeValidator.isSecured.test(request)).thenReturn(true);

    GatewayFilter filter = authenticationFilter.apply(config);

    // Act
    Mono<Void> result = filter.filter(exchange, filterChain);

    // Assert
    StepVerifier.create(result)
            .verifyComplete(); // The response is written, so the Mono completes

    assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    // Verify that the filter chain was never executed
    verifyNoInteractions(filterChain);
    verifyNoInteractions(jwtUtils);
  }

  @Test
  @DisplayName("Should throw RuntimeException when token is invalid")
  void apply_whenTokenIsInvalid_shouldThrowException() {
    // Arrange
    final String invalidToken = "invalid-jwt-token";
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/private/user-details")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + invalidToken)
            .build();
    ServerWebExchange exchange = MockServerWebExchange.from(request);

    // Mock behavior: Route is secured
    when(routeValidator.isSecured.test(request)).thenReturn(true);
    // Mock behavior: Token validation fails by throwing an exception
    doThrow(new RuntimeException("Token has expired")).when(jwtUtils).validateToken(invalidToken);

    GatewayFilter filter = authenticationFilter.apply(config);

    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class,
            () -> filter.filter(exchange, filterChain).block()); // .block() triggers the execution

    assertEquals("Unauthorized access to application", exception.getMessage());
    assertEquals("Token has expired", exception.getCause().getMessage());

    verify(jwtUtils, times(1)).validateToken(invalidToken);
    // Verify that the filter chain was never executed
    verifyNoInteractions(filterChain);
  }

  @Test
  @DisplayName("Should handle malformed Authorization header and fail validation")
  void apply_whenAuthHeaderIsMalformed_shouldFailValidation() {
    // Arrange
    final String malformedToken = "invalid-token-without-bearer";
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/private/user-details")
            .header(HttpHeaders.AUTHORIZATION, malformedToken) // No "Bearer " prefix
            .build();
    ServerWebExchange exchange = MockServerWebExchange.from(request);

    // Mock behavior: Route is secured
    when(routeValidator.isSecured.test(request)).thenReturn(true);
    // Mock behavior: The malformed token will fail validation
    doThrow(new RuntimeException("Invalid JWT format")).when(jwtUtils).validateToken(malformedToken);

    GatewayFilter filter = authenticationFilter.apply(config);

    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class,
            () -> filter.filter(exchange, filterChain).block());

    assertEquals("Unauthorized access to application", exception.getMessage());

    verify(jwtUtils, times(1)).validateToken(malformedToken);
    verifyNoInteractions(filterChain);
  }
}