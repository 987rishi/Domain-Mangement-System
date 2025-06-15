package com.dnsManagement.WorkFlowIpVaptService.errorHandling;

import com.dnsManagement.WorkFlowIpVaptService.dto.ExceptionResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

  // 1. Add a logger instance
  private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  // --- Client Errors (4xx) ---
  // These exceptions are typically caused by invalid client requests.
  // It's safe to return the exception message.

  @ExceptionHandler(NoSuchElementException.class)
  public ResponseEntity<ExceptionResponse> handleNoSuchElement(NoSuchElementException ex, HttpServletRequest request) {
    return createErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI(), ex);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ExceptionResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
    return createErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI(), ex);
  }

  // --- Server Errors (5xx) ---
  // These are unexpected errors. We log the full exception but return a generic message to the client.
  // This prevents leaking sensitive internal details.

  @ExceptionHandler({
          RuntimeException.class,
          IllegalStateException.class,
          SQLException.class,
          Exception.class,
          IllegalAccessError.class // Errors should also be caught as a last resort
  })
  public ResponseEntity<ExceptionResponse> handleInternalServerErrors(Exception ex, HttpServletRequest request) {
    String genericErrorMessage = "An unexpected internal server error occurred.";
    // For server errors, we return a generic message to the client
    return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, genericErrorMessage, request.getRequestURI(), ex);
  }


  /**
   * 2. Centralized helper method for creating and logging error responses.
   *
   * @param status The HTTP status for the response.
   * @param message The error message for the response body.
   * @param path The request path.
   * @param exception The original exception that was caught.
   * @return A fully formed ResponseEntity.
   */
  private ResponseEntity<ExceptionResponse> createErrorResponse(HttpStatus status, String message, String path, Exception exception) {
    // 3. Log the error with stack trace for debugging
    // For client errors (4xx), a warning might be sufficient. For server errors (5xx), it should be an error.
    if (status.is5xxServerError()) {
      logger.error("Server Error at path [{}]: {}", path, message, exception);
    } else {
      logger.warn("Client Error at path [{}]: {}", path, message);
    }

    ExceptionResponse response = new ExceptionResponse(
            status.value(),
            LocalDateTime.now(),
            message, // Use the (potentially generic) message passed to this method
            path
    );

    return new ResponseEntity<>(response, status);
  }
}