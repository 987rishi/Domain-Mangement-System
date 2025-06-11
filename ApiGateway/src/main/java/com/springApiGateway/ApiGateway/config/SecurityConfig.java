package com.springApiGateway.ApiGateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Configures the security settings for the API Gateway.
 * <p>
 * This class uses Spring Security's reactive module to define the security policies for all
 * incoming requests. The {@link EnableWebFluxSecurity} annotation is essential, as it activates
 * security for a non-blocking, reactive application built with Spring WebFlux, which is the
 * foundation of Spring Cloud Gateway.
 * </p>
 *
 * @see org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
 * @see org.springframework.security.web.server.SecurityWebFilterChain
 * @see org.springframework.security.config.web.server.ServerHttpSecurity
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

  /**
   * Defines the primary {@link SecurityWebFilterChain} bean that applies security rules to all
   * requests handled by the gateway.
   * <p>
   * This configuration sets up a basic security policy as follows:
   * <ul>
   *   <li><b>HTTP Basic Authentication:</b> Enabled with default settings. This requires clients
   *       to send a standard {@code Authorization: Basic <credentials>} header with every request.</li>
   *   <li><b>CSRF (Cross-Site Request Forgery) Protection:</b> Disabled. This is a common and
   *       safe practice for stateless APIs like an API Gateway, which typically use token-based
   *       authentication (like OAuth2 or JWT) and are not vulnerable to CSRF attacks that
   *       rely on session cookies.</li>
   * </ul>
   * <p>
   * <b>Security Note:</b> This configuration is foundational. It enables authentication but does
   * not define any specific authorization rules (e.g., using {@code .authorizeExchange()}).
   * By default, this means any successfully authenticated user can access any route proxied by the
   * gateway. For production systems, you should add fine-grained authorization rules to restrict
   * access to downstream services based on user roles or scopes.
   * </p>
   *
   * @param http The {@link ServerHttpSecurity} object, which is provided by Spring to build the
   *             security configuration in a reactive context.
   * @return The configured {@link SecurityWebFilterChain} instance that will be used by Spring Security.
   */
  @Bean
  public SecurityWebFilterChain securityWebFilterChain(final ServerHttpSecurity http) {
    return http
            .httpBasic(Customizer.withDefaults())
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            // Example of adding authorization:
            // .authorizeExchange(exchange -> exchange
            //     .pathMatchers("/service-a/**").hasRole("SERVICE_A_USER")
            //     .anyExchange().authenticated()
            // )
            .build();
  }
}