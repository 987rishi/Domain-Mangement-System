package com.springApiGateway.ApiGateway.exceptions;

public class UnauthorizedAccessException extends RuntimeException {

  public UnauthorizedAccessException(String message, Throwable cause) {
    super(message, cause);
  }
}
