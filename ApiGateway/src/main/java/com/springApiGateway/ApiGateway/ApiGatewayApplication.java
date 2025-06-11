package com.springApiGateway.ApiGateway;

import com.springApiGateway.ApiGateway.filters.AuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

/**
 * Main class for the API Gateway application using Spring Cloud Gateway.
 * <p>
 * This application serves as the central entry point for all microservices,
 * enabling routing, load balancing, and application of cross-cutting concerns
 * like authentication via gateway filters. It uses {@link EnableDiscoveryClient}
 * to integrate with a service registry (e.g., Eureka), allowing routes to be
 * defined using service IDs via the "lb://" (load-balanced) scheme.
 * </p>
 * <p>
 * The class centralizes all route-related constants (service IDs, route IDs,
 * circuit breaker names) to improve maintainability and avoid "magic strings"
 * in the route definitions.
 * </p>
 *
 * @see org.springframework.cloud.gateway.route.RouteLocator
 * @see com.springApiGateway.ApiGateway.filters.AuthenticationFilter
 * @see org.springframework.cloud.client.discovery.EnableDiscoveryClient
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

  // --- Service Discovery Constants ---
  /** Constants for service discovery IDs used in 'lb://' URIs. */
  private static final String USER_MANAGEMENT_SERVICE_ID = "USER-MANAGEMENT-SERVICE";
  private static final String WORKFLOW_SERVICE_ID = "WORKFLOW-SERVICE";
  private static final String RENEWAL_TRANSFER_SERVICE_ID = "RENEWAL-TRANSFER-SERVICE";
  private static final String NOTIFICATION_SERVICE_ID = "NOTIFICATION-SERVICE";

  // --- Route ID Constants ---
  /** Unique identifiers for each route definition. */
  private static final String USER_MANAGEMENT_ROUTE_ID = "user-management-routes";
  private static final String NOTIFICATION_ROUTE_ID = "notification-service-routes";
  private static final String WORKFLOW_SERVICE_ROUTE_ID = "workflow-service-routes";
  private static final String RENEWAL_TRANSFER_ROUTE_ID = "renewal-transfer-service-routes";

  // --- Circuit Breaker Name Constants ---
  /** Names for the circuit breaker configurations to be applied to routes. */
  private static final String USER_MANAGEMENT_CB = "user-management-service-circuit-breaker";
  private static final String WORKFLOW_SERVICE_CB = "workflow-service-circuit-breaker";
  private static final String RENEWAL_TRANSFER_CB = "renewal-transfer-service-circuit-breaker";
  private static final String NOTIFICATION_SERVICE_CB = "notification-service-circuit-breaker";

  // --- Path Exclusion Constants ---
  /** Constants for specific paths that require special handling or exclusion. */
  private static final String INTERNAL_EMP_PATH = "/api/users/emp";

  @Autowired
  private AuthenticationFilter authenticationFilter;

  /**
   * Main method to launch the Spring Boot API Gateway application.
   *
   * @param args Command-line arguments passed to the application.
   */
  public static void main(final String[] args) {
    SpringApplication.run(ApiGatewayApplication.class, args);
  }

  /**
   * Configures all routing rules for services behind this API Gateway.
   * <p>
   * This method defines a {@link RouteLocator} bean that contains the complete set of rules
   * for directing incoming HTTP requests to the appropriate downstream microservices. It uses a
   * fluent API provided by {@link RouteLocatorBuilder} to define each route.
   * </p>
   * <p>
   * Each route is configured with:
   * <ul>
   *   <li><b>Path Predicates:</b> To match incoming request URLs.</li>
   *   <li><b>A Custom Predicate:</b> (for user-management) to exclude a specific internal path.</li>
   *   <li><b>Filters:</b> To apply cross-cutting concerns, including:
   *     <ul>
   *       <li>A <b>Circuit Breaker</b> for resilience, preventing cascading failures.</li>
   *       <li>A custom {@link AuthenticationFilter} to secure the endpoints.</li>
   *     </ul>
   *   </li>
   *   <li><b>URI:</b> The load-balanced destination service ID (e.g., "lb://SERVICE-ID").</li>
   * </ul>
   *
   * The routes are defined as follows:
   * <ul>
   *   <li><b>{@value #USER_MANAGEMENT_ROUTE_ID}:</b> Routes requests for {@code /api/users/**},
   *       {@code /api/projects/**}, and {@code /api/auth/**} to the {@code USER-MANAGEMENT-SERVICE},
   *       but explicitly excludes the internal-only {@code /api/users/emp} path.</li>
   *   <li><b>{@value #NOTIFICATION_ROUTE_ID}:</b> Routes requests for {@code /api/v1/notifications/**}
   *       to the {@code NOTIFICATION-SERVICE}.</li>
   *   <li><b>{@value #WORKFLOW_SERVICE_ROUTE_ID}:</b> Routes a wide range of domain, workflow, and VAPT
   *       related paths to the {@code WORKFLOW-SERVICE}.</li>
   *   <li><b>{@value #RENEWAL_TRANSFER_ROUTE_ID}:</b> Routes requests for {@code /api/transfers/**}
   *       and {@code /api/renewals} to the {@code RENEWAL-TRANSFER-SERVICE}.</li>
   * </ul>
   *
   * @param builder The {@link RouteLocatorBuilder} provided by Spring to construct routes.
   * @return A {@link RouteLocator} bean containing all defined routes for the gateway.
   */
  @Bean
  public RouteLocator gatewayRoutes(final RouteLocatorBuilder builder) {
    return builder.routes()

            // Route group for User, Project, Notifications and Auth (excluding internal endpoint)
            .route(USER_MANAGEMENT_ROUTE_ID, r -> r
                    .path(
                            "/api/users/**",
                            "/api/projects/**",
                            "/api/auth/**"
                    )
                    .and()
                    // Custom predicate to exclude a specific internal path from this route
                    .predicate(exchange -> {
                      String path = exchange.getRequest().getURI().getPath();
                      return !path.equals(INTERNAL_EMP_PATH);
                    })
                    .filters(f -> f
                            .circuitBreaker(config ->
                                    config.setName(USER_MANAGEMENT_CB))
                            .filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                    .uri("lb://" + USER_MANAGEMENT_SERVICE_ID))

            // Route for the Notification service
            .route(NOTIFICATION_ROUTE_ID, r -> r
                    .path("/api/v1/notifications/**")
                    .filters(f -> f
                            .circuitBreaker(config ->
                                    config.setName(NOTIFICATION_SERVICE_CB))
                            .filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                    .uri("lb://" + NOTIFICATION_SERVICE_ID))

            // Route group for Workflow, Domain Registration, Purchase and Renewal
            .route(WORKFLOW_SERVICE_ROUTE_ID, r -> r
                    .path(
                            "/workflow/**",
                            "/domainRegistration/**",
                            "/purchase/**",
                            "/domainRenewal/**",
                            "/domain/**",
                            "/vapt/**",
                            "/ip-management/**"
                    )
                    .filters(f -> f
                            .circuitBreaker(config ->
                                    config.setName(WORKFLOW_SERVICE_CB))
                            .filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                    .uri("lb://" + WORKFLOW_SERVICE_ID))

            // Route group for Transfer and Renewals
            .route(RENEWAL_TRANSFER_ROUTE_ID, r -> r
                    .path(
                            "/api/transfers/**",
                            "/api/renewals"
                    )
                    .filters(f -> f
                            .circuitBreaker(config ->
                                    config.setName(RENEWAL_TRANSFER_CB))
                            .filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                    .uri("lb://" + RENEWAL_TRANSFER_SERVICE_ID))

            .build();
  }
}