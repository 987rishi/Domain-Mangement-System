// Define interfaces matching your expected webhook payload
import { WebhookEventType } from "./event.types";
export interface WebhookPayload {
  eventType: WebhookEventType; // Consider using an Enum for known types
  timestamp: string;
  triggeredBy: {
    emp_no: bigint;
    role: string;
  };
  data: Record<string, any>; // Be more specific based on event types if possible
  recipients: {
    [role_emp_no: string]: bigint; // e.g., { drm_emp_no: 123, hod_emp_no: 789 }
  };
}

export interface UserInfo {
  // Structure for user details needed
  emp_no: bigint;
  email: string;
  fname: string;
  role?: string; // Optional, might get from recipients key
}

export interface ApiNotification {
  notification_id: bigint | number; // Prisma uses BigInt, JSON uses number/string
  message: string;
  is_read: boolean;
  created_at: Date | string;
  link_url?: string | null;
  event_type?: string | null;
  related_entity_id?: bigint | number | null;
  related_entity_type?: string | null;
}