package com.springApiGateway.ApiGateway.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springApiGateway.ApiGateway.dto.Response;
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

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

  @Autowired
  private RouteValidator routeValidator;

  @Autowired
  private JwtUtils jwtUtils;

  private static final Logger logger =
          LoggerFactory.getLogger(AuthenticationFilter.class);


  public AuthenticationFilter() {
    super(Config.class);
  }

  @Override
  public GatewayFilter apply(final Config config) {
    return (((exchange, chain) -> {
      if (routeValidator.isSecured.test(exchange.getRequest())) {
        //If header contains token or not
        if (!exchange.getRequest().getHeaders().containsKey((HttpHeaders.AUTHORIZATION))) {
          return handleMissingAuthHeader(exchange);
        }

        String authHeader =
                exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
          //Removing the 7 whitespaces after Bearer
          authHeader = authHeader.substring(7);
        }
        //REST call to AUTH service
        try {
//          Instead of using a API call (vulnerable) can validate the token in
//           API Gateway itself
//          String res = userDetailsClient.validateJwtToken(authHeader);
          System.out.println("AUTH HEADER" + authHeader);
          jwtUtils.validateToken(authHeader);

        } catch (RuntimeException e) {

          throw new RuntimeException(e);
        }
      }

      return chain.filter(exchange);
    }
    ));
  }

  private Mono<Void> handleMissingAuthHeader(final ServerWebExchange exchange) {
    Response response = new Response(
            false,
            "Missing Authorization Header",
            null,
            null);
    return sendErrorResponse(exchange, response, HttpStatus.UNAUTHORIZED);
  }

  public static class Config {
  }

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
      throw new RuntimeException(e);
    }
    return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
  }


}
