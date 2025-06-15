package com.springApiGateway.ApiGateway.filters;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.List;
import java.util.function.Predicate;

/**
 * A utility component that determines whether a given API route is secured or public.
 * <p>
 * This class maintains a predefined whitelist of URL patterns ({@code OPENAPIS}) that are
 * considered "open" and do not require authentication. It uses Spring's {@link AntPathMatcher}
 * to support wildcard patterns (e.g., {@code /api/auth/**}).
 * </p>
 * <p>
 * It is designed to be injected as a {@link Component} into other parts of the application,
 * primarily security filters like {@link AuthenticationFilter}, to conditionally apply
 * security checks based on the request path.
 * </p>
 *
 * @see com.springApiGateway.ApiGateway.filters.AuthenticationFilter
 * @see org.springframework.util.AntPathMatcher
 */
@Slf4j
@Component
public class RouteValidator {

  /**
   * Defines the list of URL patterns that are publicly accessible and do not require authentication.
   * <p>
   * Any request whose path matches one of these patterns will be considered "open" or "public".
   * The {@code **} wildcard signifies matching any number of path segments. For example,
   * {@code /api/auth/**} will match {@code /api/auth/login}, {@code /api/auth/register}, and any
   * other path under {@code /api/auth/}.
   * </p>
   */
  private static final List<String> OPENAPIS = List.of(
          "/api/auth/**",
          "/eureka/**"
  );

  /**
   * A Spring utility used for matching request paths against the Ant-style patterns in {@link #OPENAPIS}.
   */
  private static final AntPathMatcher pathMatcher = new AntPathMatcher();

  /**
   * A {@link Predicate} that evaluates whether a given {@link ServerHttpRequest} targets a secured route.
   * <p>
   * The predicate returns {@code true} if the request's URI path does <b>not</b> match any of the
   * patterns defined in the {@link #OPENAPIS} list. It returns {@code false} if a match is found,
   * indicating the route is public and does not need authentication.
   * </p>
   * <p>
   * Usage: {@code boolean needsAuth = routeValidator.isSecured.test(request);}
   * </p>
   */
  public Predicate<ServerHttpRequest> isSecured =
          request -> {
            String path = request.getURI().getPath();
            // The route is considered "secured" if it does not match any of the open API patterns.
            boolean secured = OPENAPIS.stream()
                    .noneMatch(uri -> pathMatcher.match(uri, path));
            // For production, consider using a logger at a DEBUG or TRACE level instead of System.out.
            log.trace("Request path: {}, Secured: {}", path, secured);
            return secured;
          };
}