
package com.springApiGateway.ApiGateway.filters;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
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

  /**
   * Parameterized test to verify the isSecured predicate against various URI paths.
   * This single test method replaces multiple individual tests, reducing code duplication
   * and improving maintainability.
   *
   * @param path            The request path to test.
   * @param expectedSecured The expected boolean result (true if secured, false if public).
   */
  @ParameterizedTest(name = "Path \"{0}\" should be secured: {1}")
  @CsvSource({
          // Public Endpoints (should NOT be secured)
          "/api/auth/register,                false",
          "/api/auth/token,                   false",
          "/api/auth/validate,                false",
          "/eureka,                           false",
          "/eureka/apps,                      false",
          "/api/auth/login?token=xyz,         false", // Should ignore query parameters

          // Secured Endpoints (should BE secured)
          "/api/users/123,                    true",
          "/api/products/all,                 true",
          "/,                                 true", // Root path is not whitelisted
          "/api/authentication/check,         true", // Partial match "auth" is not enough
          "/API/AUTH/LOGIN,                   true"  // Logic is case-sensitive
  })
  @DisplayName("Verify isSecured predicate for various endpoints")
  void isSecured_returnsCorrectly_forGivenPath(String path, boolean expectedSecured) {
    // Arrange
    ServerHttpRequest request = mockRequestWithPath(path);

    // Act
    boolean isSecured = routeValidator.isSecured.test(request);

    // Assert
    assertThat(isSecured).isEqualTo(expectedSecured);
  }
}