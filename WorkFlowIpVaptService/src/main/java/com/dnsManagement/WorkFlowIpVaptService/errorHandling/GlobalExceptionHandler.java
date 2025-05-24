package com.dnsManagement.WorkFlowIpVaptService.errorHandling;

import com.dnsManagement.WorkFlowIpVaptService.dto.ExceptionResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(NoSuchElementException.class)
  public ResponseEntity<ExceptionResponse> handleNoSuchElementExceptions(
          HttpServletRequest request,
          NoSuchElementException exception) {
    ExceptionResponse response = new ExceptionResponse(
            HttpStatus.NOT_FOUND.value(),
            LocalDateTime.now(),
            exception.getMessage(),
            request.getRequestURI()
    );

    return new ResponseEntity<>(response,HttpStatus.NOT_FOUND);
  }
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ExceptionResponse> handleIllegalArgument(
          HttpServletRequest request,
          IllegalArgumentException exception
  ) {
    ExceptionResponse response = new ExceptionResponse(
            HttpStatus.BAD_REQUEST.value(),
            LocalDateTime.now(),
            exception.getMessage(),
            request.getRequestURI()
    );

    return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<ExceptionResponse> handleRuntimeExceptions(
          HttpServletRequest request,
          RuntimeException exception
  ) {
    ExceptionResponse response = new ExceptionResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            LocalDateTime.now(),
            exception.getMessage(),
            request.getRequestURI()
    );

    return new ResponseEntity<>(response,HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<ExceptionResponse> handleIllegalStateExceptions(
          HttpServletRequest request,
          IllegalStateException exception
  ) {
    ExceptionResponse response = new ExceptionResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            LocalDateTime.now(),
            exception.getMessage(),
            request.getRequestURI()
    );

    return new ResponseEntity<>(response,HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @ExceptionHandler(IllegalAccessError.class)
  public ResponseEntity<ExceptionResponse> handleIllegalAccessExceptions(
          HttpServletRequest request,
          IllegalAccessError exception
  ) {
    ExceptionResponse response = new ExceptionResponse(
            HttpStatus.BAD_GATEWAY.value(),
            LocalDateTime.now(),
            exception.getMessage(),
            request.getRequestURI()
    );

    return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ExceptionResponse> handleGenericExceptions(
          HttpServletRequest request,
          Exception exception
  ) {
    ExceptionResponse response = new ExceptionResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            LocalDateTime.now(),
            exception.getMessage(),
            request.getRequestURI()
    );
    return new ResponseEntity<>(response,HttpStatus.INTERNAL_SERVER_ERROR);
  }

}
