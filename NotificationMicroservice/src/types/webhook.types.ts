// Define interfaces matching your expected webhook payload

import { WebhookEventType } from "./event.types";

/**
 * Defines the definitive structure for an incoming webhook request body.
 * This is the primary data contract for the notification service.
 */
export interface WebhookPayload {
  /** The type of event that occurred. Must be a value from the {@link WebhookEventType} enum. */
  eventType: WebhookEventType; // Consider using an Enum for known types
  /** An ISO 8601 formatted string representing when the event was generated. */
  timestamp: string;
  /** Information about the user or system that triggered the event. */
  triggeredBy: {
    emp_no: bigint;
    role: string;
  };
  /** A flexible object containing event-specific data. The structure of this object varies depending on the `eventType`. */
  data: Record<string, any>; // Be more specific based on event types if possible
  /**
   * A dictionary mapping a role-based identifier to the employee number of the recipient.
   * This determines who should be notified about the event.
   * @example { "drm_emp_no": 123, "hod_emp_no": 789 }
   */
  recipients: {
    [role_emp_no: string]: bigint; // e.g., { drm_emp_no: 123, hod_emp_no: 789 }
  };
}

/**
 * Represents the essential details of a user, typically fetched from an external
 * User Management service, required for sending a personalized notification.
 */
export interface UserInfo {
  // Structure for user details needed
  emp_no: bigint;
  email: string;
  fname: string;
}

/**
 * Defines the structure of a notification object as it is sent to the client via API.
 * This is a "Data Transfer Object" (DTO) representation.
 */
export interface ApiNotification {
  /**
   * The unique identifier for the notification.
   * @remarks Prisma returns this as a `BigInt`, but for JSON serialization,
   * it is typically converted to a `number` or `string` before being sent to the client.
   */
  notification_id: bigint | number; // Prisma uses BigInt, JSON uses number/string
  message: string;
  is_read: boolean;
  created_at: Date | string;
  event_type?: string | null;
  related_entity_id?: bigint | number | null;
  related_entity_type?: string | null;
}