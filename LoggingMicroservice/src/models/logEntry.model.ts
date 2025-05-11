import mongoose, { Schema, Document } from "mongoose";

export type LogLevelType =
  | "FATAL"
  | "ERROR"
  | "WARN"
  | "INFO"
  | "DEBUG"
  | "TRACE";

export interface ILogEntry extends Document {
  timestamp: Date;
  level: LogLevelType;
  service_name: string;
  instance_id?: string;
  correlation_id?: string;
  user_id?: string;
  message: string;
  details?: Record<string, any>; // Flexible for additional structured data
}

const LogEntrySchema: Schema = new Schema(
  {
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    level: {
      type: String,
      enum: ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"],
      required: true,
      index: true,
    },
    service_name: { type: String, required: true, index: true },
    instance_id: { type: String, index: true },
    correlation_id: { type: String, index: true },
    user_id: { type: String, index: true },
    message: { type: String, required: true },
    details: { type: Schema.Types.Mixed }, // Allows any JSON object
  },
  {
    timestamps: { createdAt: "receivedAt", updatedAt: false }, // When the log was received by this service
    versionKey: false,
  }
);

// Optional: Create a TTL index to automatically delete old logs
// LogEntrySchema.index({ receivedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // e.g., 30 days

export default mongoose.model<ILogEntry>("LogEntry", LogEntrySchema);
