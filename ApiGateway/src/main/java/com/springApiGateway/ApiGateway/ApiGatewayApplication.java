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
 * enabling routing, load balancing, and pre-routing filters (e.g., authentication).
 * The routing definitions rely on service discovery (e.g., Eureka) using the "lb://" scheme.
 * </p>
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

  // --- Constants for Service IDs and Route IDs ---
  private static final String USER_MANAGEMENT_SERVICE_ID = "USER-MANAGEMENT-SERVICE";
  private static final String WORKFLOW_SERVICE_ID = "WORKFLOW-SERVICE";
  private static final String RENEWAL_TRANSFER_SERVICE_ID = "RENEWAL-TRANSFER-SERVICE";
  private static final String NOTIFICATION_SERVICE_ID = "NOTIFICATION-SERVICE";

  private static final String USER_MANAGEMENT_ROUTE_ID = "user-management-routes";
  private static final String UNREAD_NOTIFICATIONS_ROUTE_ID = "unread-notifications-route";
  private static final String WORKFLOW_SERVICE_ROUTE_ID = "workflow-service-routes";
  private static final String RENEWAL_TRANSFER_ROUTE_ID = "renewal-transfer-service-routes";
  private static final String NOTIFICATION_ROUTE_ID = "notification-service" +
          "-routes";

  // --- Constants for Circuit Breaker Names ---
  private static final String USER_MANAGEMENT_CB = "user-management-service-circuit-breaker";
  private static final String WORKFLOW_SERVICE_CB = "workflow-service-circuit-breaker";
  private static final String RENEWAL_TRANSFER_CB = "renewal-transfer-service-circuit-breaker";
  private static final String NOTIFICATION_SERVICE_CB = "notification-service" +
          "-circuit-breaker";

  // --- Constants for Path Exclusions ---
  private static final String INTERNAL_EMP_PATH = "/api/users/emp";

  @Autowired
  private AuthenticationFilter authenticationFilter;

  /**
   * Main method to launch the Spring Boot API Gateway application.
   *
   * @param args Application arguments
   */
  public static void main(final String[] args) {
    SpringApplication.run(ApiGatewayApplication.class, args);
  }

  /**
   * Configures all routing rules for services behind this API Gateway.
   * <p>
   * It applies circuit breakers and a custom authentication filter where needed.
   * </p>
   *
   * @param builder {@link RouteLocatorBuilder} to define routes.
   * @return A {@link RouteLocator} bean to be managed by Spring.
   */
  @Bean
  public RouteLocator gatewayRoutes(final RouteLocatorBuilder builder) {
    return builder.routes()

            // Route group for User, Project, Notifications and Auth (excluding internal endpoint)
            .route(USER_MANAGEMENT_ROUTE_ID, r -> r
                    .path(
                            "/api/users/**",
                            "/api/projects/**",
//                            "/api/v1/notifications/**",
                            "/api/auth/**"
                    )
                    .and()
                    .predicate(exchange -> {
                      String path = exchange.getRequest().getURI().getPath();
                      return !path.equals(INTERNAL_EMP_PATH);
                    })
                    .filters(f -> f
                            .circuitBreaker(config ->
                                    config.setName(USER_MANAGEMENT_CB))
                            .filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                    .uri("lb://" + USER_MANAGEMENT_SERVICE_ID))

            // Route for unread notifications (requires `?unread=true` query param)
            .route(NOTIFICATION_ROUTE_ID, r -> r
                    .path("/api/v1/notifications/**")
//                    .query("unread", "true")
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
                            "/vapt/**"
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
//                            .circuitBreaker(config ->
//                                    config.setName(RENEWAL_TRANSFER_CB))
                            .filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                    .uri("lb://" + RENEWAL_TRANSFER_SERVICE_ID))

            .build();
  }
}
