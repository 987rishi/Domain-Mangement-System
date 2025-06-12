package com.springApiGateway.ApiGateway.filters;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.net.URI;
import java.net.URISyntaxException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the {@link RouteValidator} class.
 * <p>
 * This test suite verifies that the {@code isSecured} predicate correctly identifies
 * which API routes require authentication and which are public.
 * </p>
 *
 * @see RouteValidator
 */
@ExtendWith(MockitoExtension.class)
class RouteValidatorTest {

  private RouteValidator routeValidator;

  /**
   * Sets up a new instance of the {@link RouteValidator} before each test.
   * This ensures test isolation.
   */
  @BeforeEach
  void setUp() {
    routeValidator = new RouteValidator();
  }

  /**
   * A helper method to create a mock {@link ServerHttpRequest} with a specific URI path.
   * This reduces boilerplate code in the test methods.
   *
   * @param path The URI path for the mock request.
   * @return A mocked {@link ServerHttpRequest}.
   */
  private ServerHttpRequest mockRequestWithPath(String path) {
    ServerHttpRequest request = mock(ServerHttpRequest.class);
    try {
      // URI object is needed by the request mock
      when(request.getURI()).thenReturn(new URI("http://localhost" + path));
    } catch (URISyntaxException e) {
      // This should not happen in a controlled test environment
      throw new RuntimeException(e);
    }
    return request;
  }

  @Test
  @DisplayName("Should return FALSE for a public auth endpoint like /api/auth/login")
  void isSecured_shouldReturnFalse_whenPathIsPublicAuthEndpoint() {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath("/api/auth/login");

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    assertThat(isSecured).isFalse();
  }

  @Test
  @DisplayName("Should return FALSE for a deep public auth endpoint like /api/auth/validate/token")
  void isSecured_shouldReturnFalse_whenPathIsDeepPublicAuthEndpoint() {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath("/api/auth/validate/token");

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    assertThat(isSecured).isFalse();
  }

  @Test
  @DisplayName("Should return FALSE for a public Eureka endpoint like /eureka/apps")
  void isSecured_shouldReturnFalse_whenPathIsPublicEurekaEndpoint() {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath("/eureka/apps");

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    assertThat(isSecured).isFalse();
  }

  @Test
  @DisplayName("Should return FALSE for the root Eureka path /eureka/")
  void isSecured_shouldReturnFalse_whenPathIsRootEurekaPath() {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath("/eureka/");

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    assertThat(isSecured).isFalse();
  }

  @Test
  @DisplayName("Should return TRUE for a secured user-related endpoint")
  void isSecured_shouldReturnTrue_whenPathIsSecuredUserEndpoint() {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath("/api/users/123");

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    assertThat(isSecured).isTrue();
  }

  @Test
  @DisplayName("Should return TRUE for a secured product-related endpoint")
  void isSecured_shouldReturnTrue_whenPathIsSecuredProductEndpoint() {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath("/api/products/all");

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    assertThat(isSecured).isTrue();
  }

  @Test
  @DisplayName("Should return TRUE for a path that partially matches but is not whitelisted")
  void isSecured_shouldReturnTrue_forPartialMatch() {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath("/api/authentication/check"); // 'auth' vs 'authentication'

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    assertThat(isSecured).isTrue();
  }

  @Test
  @DisplayName("Should return TRUE for a root path that is not whitelisted")
  void isSecured_shouldReturnTrue_forRootPath() {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath("/");

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    assertThat(isSecured).isTrue();
  }

  @Test
  @DisplayName("Should ignore query parameters and return FALSE for a public endpoint")
  void isSecured_shouldIgnoreQueryParams_andReturnFalseForPublicEndpoint() {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath("/api/auth/login?token=xyz");

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    assertThat(isSecured).isFalse();
  }

  @Test
  @DisplayName("Should be case-sensitive and return TRUE for an uppercase path")
  void isSecured_shouldBeCaseSensitive_andReturnTrueForUppercasePath() {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath("/API/AUTH/LOGIN");

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    // AntPathMatcher is case-sensitive by default, so "/API/AUTH/LOGIN" does NOT match "/api/auth/**"
    assertThat(isSecured).isTrue();
  }
}