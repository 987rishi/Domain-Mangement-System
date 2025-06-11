package com.dnsManagement.WorkFlowIpVaptService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configures the web security for the WorkFlowIpVaptService application.
 * <p>
 * This class uses Spring Security to define a custom security policy. The {@link EnableWebSecurity}
 * annotation enables Spring Security's web security support and provides the default security
 * configuration that can be customized by defining a {@link SecurityFilterChain} bean.
 * </p>
 *
 * @see org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
 * @see org.springframework.security.web.SecurityFilterChain
 */
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

  /**
   * Defines the primary {@link SecurityFilterChain} bean that configures the application's security policies.
   * <p>
   * This method sets up the HTTP security rules for all incoming requests. The configuration is
   * defined as follows:
   * <ul>
   *   <li><b>CORS (Cross-Origin Resource Sharing)</b>: Disabled. This might be suitable if the
   *       service is not exposed directly to a web browser or if CORS is handled at a higher
   *       level, such as by an API Gateway.</li>
   *   <li><b>CSRF (Cross-Site Request Forgery)</b>: Disabled. Disabling CSRF is a common practice
   *       for stateless REST APIs that use token-based authentication (like JWT) and are not
   *       vulnerable to session-based CSRF attacks.</li>
   *   <li><b>HTTP Basic Authentication</b>: Enabled with default settings. The service will
   *       expect an `Authorization` header with `Basic <credentials>` for authentication.</li>
   * </ul>
   * <p>
   * <b>Note:</b> This configuration does not specify any authorization rules
   * (e.g., using {@code .authorizeHttpRequests()}). Without explicit authorization rules,
   * Spring Security's default behavior is to permit any request that is successfully authenticated.
   * This setup should be reviewed and extended with specific endpoint permissions for a production environment.
   * </p>
   *
   * @param http The {@link HttpSecurity} object to be configured. This is injected by Spring
   *             and allows for the customization of security rules.
   * @return The configured {@link SecurityFilterChain} instance.
   * @throws Exception if an error occurs during the configuration.
   */
  @Bean
  public SecurityFilterChain securityConfig(HttpSecurity http) throws Exception {
    return http
            .cors(AbstractHttpConfigurer::disable)
            .csrf(AbstractHttpConfigurer::disable)
            // .authorizeHttpRequests(req -> req.anyRequest().authenticated()) // Example of securing all endpoints
            .httpBasic(Customizer.withDefaults())
            .build();
  }

}