package com.springApiGateway.ApiGateway.service;


import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the {@link JwtUtils} class.
 *
 * These tests verify the token validation logic in isolation, without needing a running
 * Spring application context.
 */
class JwtUtilsTest {

  // A test instance of the class we are testing.
  private JwtUtils jwtUtils;

  // A valid, BASE64URL-encoded secret key for testing.
  // In a real scenario, this would come from a secure configuration.
  private static final String TEST_SECRET = "jxgEQeXHuP_qw95F_3-0o9x8Y0Vb-TSvYNtGXB2gLGA";

  // A different secret key to test invalid signature scenarios.
  private static final String INVALID_TEST_SECRET = "anotherSecretKeyThatIsDifferentAndAlsoBase64EncodedString";

  /**
   * Sets up the test environment before each test case.
   * This method initializes a new JwtUtils instance and uses ReflectionTestUtils
   * to inject the test secret, simulating Spring's @Value injection.
   */
  @BeforeEach
  void setUp() {
    jwtUtils = new JwtUtils();
    // Manually set the private 'secret' field on the jwtUtils instance.
    // This is a standard practice for testing components that have @Value fields.
    ReflectionTestUtils.setField(jwtUtils, "secret", TEST_SECRET);
  }

  @Test
  @DisplayName("Should not throw exception for a valid token")
  void validateToken_withValidToken_shouldNotThrowException() {
    // Arrange: Create a valid token signed with the correct secret key.
    String validToken = generateToken(
            "test-user",
            Date.from(Instant.now().plus(1, ChronoUnit.HOURS)), // Expires in 1 hour
            getSigningKey(TEST_SECRET)
    );

    // Act & Assert: Verify that validateToken does not throw any exceptions.
    assertDoesNotThrow(() -> jwtUtils.validateToken(validToken));
  }

  @Test
  @DisplayName("Should throw SignatureException for a token with an invalid signature")
  void validateToken_withInvalidSignature_shouldThrowSignatureException() {
    // Arrange: Create a token signed with a DIFFERENT secret key.
    String tokenWithWrongSignature = generateToken(
            "test-user",
            Date.from(Instant.now().plus(1, ChronoUnit.HOURS)),
            getSigningKey(INVALID_TEST_SECRET) // Signed with the wrong key
    );

    // Act & Assert: Expect a SignatureException to be thrown.
    Exception exception = assertThrows(SignatureException.class, () -> {
      jwtUtils.validateToken(tokenWithWrongSignature);
    });

    assertTrue(exception.getMessage().contains("JWT signature does not match"));
  }

  @Test
  @DisplayName("Should throw ExpiredJwtException for an expired token")
  void validateToken_withExpiredToken_shouldThrowExpiredJwtException() {
    // Arrange: Create a token that has already expired.
    String expiredToken = generateToken(
            "test-user",
            Date.from(Instant.now().minus(1, ChronoUnit.MINUTES)), // Expired 1 minute ago
            getSigningKey(TEST_SECRET)
    );

    // Act & Assert: Expect an ExpiredJwtException to be thrown.
    assertThrows(ExpiredJwtException.class, () -> {
      jwtUtils.validateToken(expiredToken);
    });
  }

  @Test
  @DisplayName("Should throw MalformedJwtException for a malformed token")
  void validateToken_withMalformedToken_shouldThrowMalformedJwtException() {
    // Arrange: A string that is not a valid JWT.
    String malformedToken = "this-is-not-a-valid-jwt";

    // Act & Assert: Expect a MalformedJwtException.
    assertThrows(MalformedJwtException.class, () -> {
      jwtUtils.validateToken(malformedToken);
    });
  }

  @Test
  @DisplayName("Should throw IllegalArgumentException for a null token")
  void validateToken_withNullToken_shouldThrowIllegalArgumentException() {
    // Arrange: The token is null.

    // Act & Assert: The JJWT library throws an IllegalArgumentException for null input.
    assertThrows(IllegalArgumentException.class, () -> {
      jwtUtils.validateToken(null);
    });
  }

  /**
   * Helper method to generate a JWT for testing purposes.
   *
   * @param subject The subject of the token (e.g., username).
   * @param expirationDate The expiration date of the token.
   * @param key The secret key to sign the token with.
   * @return A signed JWT string.
   */
  private String generateToken(String subject, Date expirationDate, SecretKey key) {
    return Jwts.builder()
            .subject(subject)
            .issuedAt(new Date())
            .expiration(expirationDate)
            .signWith(key)
            .compact();
  }

  /**
   * Helper method to generate a SecretKey from a BASE64URL string,
   * mirroring the private method in JwtUtils.
   */
  private SecretKey getSigningKey(String secret) {
    byte[] keyBytes = Decoders.BASE64URL.decode(secret);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}