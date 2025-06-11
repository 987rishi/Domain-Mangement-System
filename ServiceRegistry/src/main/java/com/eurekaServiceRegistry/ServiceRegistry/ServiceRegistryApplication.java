package com.eurekaServiceRegistry.ServiceRegistry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * The main entry point for the Eureka Service Registry application.
 * <p>
 * This class is responsible for bootstrapping the Spring Boot application and activating
 * the Eureka server functionality. It is annotated with {@link EnableEurekaServer}, which
 * configures this application to act as a central service registry.
 * </p>
 * In a microservices architecture, the Service Registry acts as a central "phone book"
 * where individual microservices (Eureka clients) can register their location (host, port, etc.)
 * and discover the locations of other services they need to communicate with. This enables
 * dynamic service discovery, resilience, and scalability.
 *
 * @see org.springframework.cloud.netflix.eureka.server.EnableEurekaServer
 * @see org.springframework.boot.autoconfigure.SpringBootApplication
 *
 * @author Rishi
 * @version 1.0
 * @since 2023-10-27
 */
@SpringBootApplication
@EnableEurekaServer
public class ServiceRegistryApplication {

  /**
   * The main method, which serves as the entry point for the Java application.
   * <p>
   * This method uses Spring Boot's {@link SpringApplication#run(Class, String...)}
   * to launch the application. It initializes the Spring Application Context,
   * starts the embedded web server (e.g., Tomcat), and deploys the Eureka Server.
   * </p>
   *
   * @param args Command-line arguments passed to the application. These are
   *             forwarded to the SpringApplication.
   */
  public static void main(String[] args) {
    SpringApplication.run(ServiceRegistryApplication.class, args);
  }

}