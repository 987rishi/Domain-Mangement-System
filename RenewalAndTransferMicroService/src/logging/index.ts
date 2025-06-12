// src/logging/index.ts

import winston, { format } from "winston";
import { requestContext } from "../context/requestContext";
import { HttpTransport } from "./httpTransport";

// Your DTO defines these levels
const customLevels = {
  levels: {
    FATAL: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    TRACE: 5,
  },
  colors: {
    FATAL: "bold red",
    ERROR: "red",
    WARN: "yellow",
    INFO: "green",
    DEBUG: "blue",
    TRACE: "gray",
  },
};

winston.addColors(customLevels.colors);

// This format function transforms the log object to match your DTO
const dtoFormat = format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    const context = requestContext.getStore();

    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      level: level.toUpperCase(),
      service_name:
        process.env.SERVICE_NAME || "RenewalAndTransferMicroservice",
      instance_id: process.env.INSTANCE_ID || "unknown",
      correlation_id: context?.correlationId,
      user_id: context?.userId,
      message: message,
      details: metadata,
    };

    return JSON.stringify(logEntry);
  }
);

const logger = winston.createLogger({
  level: "TRACE", // Log everything from TRACE and up
  levels: customLevels.levels,
  format: format.combine(
    format.timestamp(),
    format.splat(), // Handles string interpolation like logger.info('user %s', userId)
    format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
    dtoFormat
  ),
  transports: [
    // Transport for sending logs to the central logging service
    new HttpTransport({
      url: "http://localhost:5001/api/v1/logs",
      level: "INFO", // Send INFO and higher to the remote service
    }),
  ],
  // Do not exit on handled exceptions
  exitOnError: false,
});

// For local development, it's useful to see logs in the console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          const { timestamp, level, message, metadata } = info;
          const context = requestContext.getStore();
          const details = Object.keys(metadata).length
            ? JSON.stringify(metadata)
            : "";
          return `[${timestamp}] [${
            context?.correlationId || "NO-CORR-ID"
          }] ${level}: ${message} ${details}`;
        })
      ),
    })
  );
}

export default logger;
