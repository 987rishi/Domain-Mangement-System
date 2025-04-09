package com.springApiGateway.ApiGateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

/*
* API GATEWAY ACTS AS A FRONT DOOR FOR ALL THE MICROSERVICES
* CLIENT HAS TO HIT REQUESTS AT API GATEWAY
* API GATEWAY THEN ROUTES THOSE REQUESTS TO APPROPRIATE DOWNSTREAM MICROSERVICES
* THE lb IN URI OF ROUTES STANDS FOR LOAD BALANCER. IT IMPLIES THAT SEARCH FOR THE SERVICE THROUGH LOAD BALANCER(LOAD BALANCER WILL GIVE THE ACTUAL ADDRESS OF THE SERVICE )
* */

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

	@Bean
	public RouteLocator myRoutes(RouteLocatorBuilder builder){
		return builder
				.routes()
				.route("user-management-routes",r -> r
								.path("/api/users/**","/api/auth/**","/api/projects/**","/api/v1/notifications/**")
								.and()
								.predicate(exchange -> {
									String path = exchange.getRequest().getURI().getPath();
									// Adjust the condition if you only want to exclude the exact path.
									//WE DONT WANT TO EXPOSE THIS API TO FRONTEND(CLIENT). ITS FOR INTERNAL USE ONLY
									return !path.equals("/api/users/emp");
								})
								.filters(f->f.circuitBreaker(config->config.setName("user-management-service-circuit-breaker")))
								.uri("lb://USER-MANAGEMENT-SERVICE"))

				.route("unread-notifications",p->p
						.path("/api/v1/notifications")
						.and()
						.query("unread","true")
						.filters(f->f.circuitBreaker(config->config.setName("user-management-service-circuit-breaker")))
						.uri("lb://USER-MANAGEMENT-SERVICE"))

				.route("workflow-service-routes",p->p
						.path("/workflow/**","/domainRegistration/**","/purchase/**","/domainRenewal/**")
						.filters(f->f.circuitBreaker(c->c.setName("workflow-service-circuit-breaker")))
						.uri("lb://WORKFLOW-SERVICE"))

				.route("renewal-transfer-service",p->p
						.path("/api/transfers/**","/api/renewals")
						.filters(f->f
								.circuitBreaker(config->config
										.setName("renewal-transfer-service-circuit-breaker")))
						.uri("lb://RENEWAL-TRANSFER-SERVICE"))

				.build();
	}

	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

}
