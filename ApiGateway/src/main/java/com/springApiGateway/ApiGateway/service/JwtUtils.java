package com.springApiGateway.ApiGateway.service;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

/**
 * A service utility for handling JSON Web Token (JWT) validation.
 * <p>
 * This class is responsible for parsing and verifying the cryptographic signature of JWTs
 * passed in the {@code Authorization} header. It uses a shared secret key that must be
 * identical to the key used by the authentication service (e.g., USER-MANAGEMENT-SERVICE)
 * that originally issued the token.
 * </p>
 * <p>
 * The validation process ensures that the token has not been tampered with and was signed by a trusted issuer.
 * </p>
 *
 * @see com.springApiGateway.ApiGateway.filters.AuthenticationFilter
 * @see io.jsonwebtoken.Jwts
 */
@Service
public class JwtUtils {

  /**
   * The secret key used to sign and verify JWTs. This key is injected from the application's
   * external configuration (e.g., application.yml or environment variables).
   * <p>
   * <b>IMPORTANT:</b> This secret must be a securely stored, high-entropy string and must be
   * exactly the same as the one used by the service that generates the tokens. It should be
   * BASE64URL encoded.
   * </p>
   */
  @Value("${SECRET}")
  private String secret; // Corrected: Removed 'static final' to allow Spring injection.

  /**
   * Validates the provided JWT string.
   * <p>
   * This method parses the token and verifies its signature using the configured secret key.
   * If the token is valid (i.e., its signature is correct, it's not expired, and it's not
   * malformed), the method completes successfully.
   * </p>
   * <p>
   * If the token is invalid for any reason, this method will throw a {@link JwtException}
   * (or one of its subclasses like {@code SignatureException}, {@code ExpiredJwtException}, etc.).
   * The caller is responsible for catching this exception to handle authentication failures.
   * </p>
   *
   * @param token The raw JWT string (without the "Bearer " prefix).
   * @throws JwtException if the token is expired, malformed, or has an invalid signature.
   */
  public void validateToken(final String token) {
    Jwts.parser()
            .verifyWith(getSignKey())
            .build()
            .parseSignedClaims(token);
  }

  /**
   * Generates a cryptographic {@link SecretKey} from the configured BASE64URL-encoded secret string.
   * <p>
   * This is a private helper method that decodes the secret string and converts it into
   * a {@code SecretKey} object suitable for use with HMAC-SHA algorithms, as required
   * by the JJWT library.
   * </p>
   *
   * @return A {@link SecretKey} instance for signature verification.
   */
  private SecretKey getSignKey() {
    byte[] keyBytes = Decoders.BASE64URL.decode(secret);
    return Keys.hmacShaKeyFor(keyBytes);
  }

}