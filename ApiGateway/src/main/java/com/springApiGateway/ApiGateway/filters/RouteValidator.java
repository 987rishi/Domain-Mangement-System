package com.springApiGateway.ApiGateway.filters;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {
  private static final List<String> OPENAPIS = List.of(
          "/api/auth/**",
          "/eureka/**"
  );

  private static final AntPathMatcher pathMatcher = new AntPathMatcher();

  public Predicate<ServerHttpRequest> isSecured =
          request -> {
            String path = request.getURI().getPath();
            boolean secured = OPENAPIS.stream().noneMatch(uri -> pathMatcher.match(uri, path));
            System.out.println("Request path: " + path + ", Secured: " + secured);
            return secured;
          };

}
