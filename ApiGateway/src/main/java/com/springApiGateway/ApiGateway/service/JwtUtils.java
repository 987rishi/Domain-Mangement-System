package com.springApiGateway.ApiGateway.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

@Service
public class JwtUtils {

  //Secret should be same as used in user-management-service for generation
  private static final String SECRET = "730a9a84ff31ff1f81f9a7c4f2e4bcf9b72adfcb575df85b543162c62e2adf652d791fc2374a032dfa23f84bcc17f5b74019b133c35152f9052db6b1fead90622fc77d3c8471b9057beba90be62a010444ad38a4226efc9e85b8f716b898b11adcb74bfba9d61b35608bdf4fb6ec96386cb11c2e8f8389e314db73f7c35f42403e82f232890d9ed1a4d6e57d6b007b3dbdd9ccbb1b50bcf50a902d3114de2a5580ae61a00a5b8fd7403d78534d27516c357155c4cd219df708a0f96e01e0ba5e6c60452a18c186efb612e88456d3da98a9e8ac8e7c2b4405424917a7a32f64122c4ea8d0a47596bbe897c99251cff37ace26d4aadca13b2b23d6676919f25830";

  public void validateToken(final String token) {
    Jwts.parser().verifyWith(getSignKey()).build().parseSignedClaims(token);
  }

  private SecretKey getSignKey() {
    byte[] keyBytes = Decoders.BASE64URL.decode(SECRET);
    return Keys.hmacShaKeyFor(keyBytes);
  }

}
