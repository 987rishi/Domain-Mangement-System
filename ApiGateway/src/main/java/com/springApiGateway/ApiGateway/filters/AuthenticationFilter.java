package com.springApiGateway.ApiGateway.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springApiGateway.ApiGateway.dto.Response;
import com.springApiGateway.ApiGateway.exceptions.UnauthorizedAccessException;
import com.springApiGateway.ApiGateway.service.JwtUtils;
import org.apache.http.HttpHeaders;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.util.Objects;

/**
 * A custom Spring Cloud Gateway filter for authenticating incoming requests using JWT.
 * <p>
 * This filter intercepts requests and, using a {@link RouteValidator}, determines if the
 * requested route is a secured endpoint. For secured routes, it inspects the {@code Authorization}
 * header for a Bearer token. It then uses the {@link JwtUtils} service to validate the token's
 * integrity and expiration.
 * </p>
 * <p>
 * If the token is missing, invalid, or expired, the filter short-circuits the request chain
 * and sends a 401 Unauthorized response. If the token is valid, the request is allowed to
 * proceed to the downstream service.
 * </p>
 * This class extends {@link AbstractGatewayFilterFactory} to be easily integrated into the
 * gateway's filter chain via configuration (e.g., in {@code application.yml}).
 *
 * @see com.springApiGateway.ApiGateway.filters.RouteValidator
 * @see com.springApiGateway.ApiGateway.service.JwtUtils
 * @see org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory
 * @see org.springframework.cloud.gateway.filter.GatewayFilter
 */
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

  private RouteValidator routeValidator;
  private JwtUtils jwtUtils;

  private static final Logger logger =
          LoggerFactory.getLogger(AuthenticationFilter.class);

  @Autowired
  public AuthenticationFilter(JwtUtils jwtUtils, RouteValidator routeValidator) {
    this.jwtUtils = jwtUtils;
    this.routeValidator = routeValidator;
  }



  /**
   * Default constructor that passes the configuration class to the superclass.
   */
  public AuthenticationFilter() {
    super(Config.class);
  }

  /**
   * Applies the authentication logic to the gateway filter chain.
   * <p>
   * This is the core method of the filter. It defines the logic to be executed for each request:
   * <ol>
   *   <li>Check if the route is secured using {@link RouteValidator}.</li>
   *   <li>If secured, verify the presence of the {@code Authorization} header. If missing,
   *       reject the request with 401 Unauthorized.</li>
   *   <li>Extract the Bearer token from the header.</li>
   *   <li>Delegate token validation to {@link JwtUtils#validateToken(String)}.</li>
   *   <li>If validation fails, an exception is thrown and the request is rejected.</li>
   *   <li>If the route is not secured or validation succeeds, the request is passed down the
   *       filter chain via {@code chain.filter(exchange)}.</li>
   * </ol>
   *
   * @param config The configuration object for this filter. Although currently empty, it follows the factory pattern.
   * @return A {@link GatewayFilter} instance containing the reactive authentication logic.
   */
  @Override
  public GatewayFilter apply(final Config config) {
    return ((exchange, chain) -> {
      if (routeValidator.isSecured.test(exchange.getRequest())) {
        //If header contains token or not
        if (!exchange.getRequest().getHeaders().containsKey((HttpHeaders.AUTHORIZATION))) {
          logger.warn("Missing Authorization header for secured route: {}", exchange.getRequest().getURI());
          return handleMissingAuthHeader(exchange);
        }

        String authHeader =
                Objects.requireNonNull(exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION)).get(0);
        if (authHeader != null && authHeader.startsWith("Bearer "))
          //Removing the 7 characters "Bearer "
          authHeader = authHeader.substring(7);

        //REST call to AUTH service
        try {
          // Instead of using an API call (vulnerable), validate the token in the API Gateway itself.
          jwtUtils.validateToken(authHeader);
          logger.info("Token validated successfully for route: {}", exchange.getRequest().getURI());

        } catch (Exception e) {
//          String errorMessage = String.format("Unauthorized access attempt for route: %s", exchange.getRequest().getURI());
//          // In a real app, you would have specific exceptions for expired, malformed tokens etc.
//          // and return a more specific error response.
//          throw new UnauthorizedAccessException(errorMessage, e);

          logger.error("Invalid token for route: {}. Error: {}",
                  exchange.getRequest().getURI(), e.getMessage());

          String errorMessage = "Unauthorized access attempt for route: " + exchange.getRequest().getURI();
          UnauthorizedAccessException reactiveException = new UnauthorizedAccessException(errorMessage, e);

          // This correctly propagates the error through the reactive stream
          // so that downstream subscribers (like StepVerifier) can handle it.
          return Mono.error(reactiveException);
        }
      }

      return chain.filter(exchange);
    }
    );
  }

  /**
   * Handles the specific error case where the Authorization header is missing from a secured route.
   * It constructs a standardized error {@link Response} and uses {@link #sendErrorResponse} to
   * terminate the request with a 401 Unauthorized status.
   *
   * @param exchange The current server exchange.
   * @return A {@link Mono<Void>} indicating the completion of the error response handling.
   */
  private Mono<Void> handleMissingAuthHeader(final ServerWebExchange exchange) {
    Response response = new Response(
            false,
            "Missing Authorization Header",
            null,
            null);
    return sendErrorResponse(exchange, response, HttpStatus.UNAUTHORIZED);
  }

  /**
   * A nested configuration class required by {@link AbstractGatewayFilterFactory}.
   * This class can be extended in the future to allow for passing configuration parameters
   * to the filter from the `application.yml` file. Currently, it is empty as no
   * configuration is needed.
   */
  public static class Config {
  }

  /**
   * A utility method to send a customized JSON error response to the client.
   * <p>
   * It sets the HTTP status code, sets the content type to JSON, serializes the response body,
   * and writes it to the {@link ServerHttpResponse}. This method is designed to work within
   * the reactive pipeline.
   * </p>
   *
   * @param exchange     The current server exchange.
   * @param responseBody The {@link Response} object to be serialized into the JSON body.
   * @param status       The {@link HttpStatus} to set for the response.
   * @return A {@link Mono<Void>} that signals the completion of writing the response.
   */
  private Mono<Void> sendErrorResponse(final ServerWebExchange exchange,
                                       final Response responseBody,
                                       final HttpStatus status) {
    ServerHttpResponse response = exchange.getResponse();
    response.setStatusCode(status);
    response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

    byte[] bytes;
    try {
      bytes = new ObjectMapper().writeValueAsBytes(responseBody);

    } catch (Exception e) {
      logger.error("Error writing JSON response: {}", e.getMessage());
      // Fallback in case serialization fails
      response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
      return response.setComplete();
    }
    return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
  }

}