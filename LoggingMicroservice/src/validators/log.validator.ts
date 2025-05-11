import { z } from "zod";
import { LogLevelType as ModelLogLevelType } from "../models/logEntry.model"; // Import the type

const logLevels: [ModelLogLevelType, ...ModelLogLevelType[]] = [
  "FATAL",
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
  "TRACE",
];
export const LogLevel = z.enum(logLevels);
export type LogLevelZodType = z.infer<typeof LogLevel>;

export const createLogEntrySchema = z.object({
  timestamp: z.string().datetime().optional(), // ISO 8601 datetime string, client can provide
  level: LogLevel,
  service_name: z.string().min(1, "Service name cannot be empty"),
  instance_id: z.string().optional(),
  correlation_id: z.string().optional(),
  user_id: z.string().optional(),
  message: z.string().min(1, "Message cannot be empty"),
  details: z.record(z.any()).optional(),
});

export type CreateLogEntryInput = z.infer<typeof createLogEntrySchema>;

export const getLogsQuerySchema = z.object({
  level: LogLevel.optional(),
  service_name: z.string().optional(),
  instance_id: z.string().optional(),
  correlation_id: z.string().optional(),
  user_id: z.string().optional(),
  startDate: z
    .string()
    .datetime({ message: "Invalid start date format, should be ISO 8601" })
    .optional(),
  endDate: z
    .string()
    .datetime({ message: "Invalid end date format, should be ISO 8601" })
    .optional(),
  message: z.string().optional(), // Allow searching by message content
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  sortBy: z.enum(["timestamp", "receivedAt"]).optional().default("timestamp"), // Allow sorting by event time or ingestion time
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type GetLogsQueryInput = z.infer<typeof getLogsQuerySchema>;
