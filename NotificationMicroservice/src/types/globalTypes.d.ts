import { WebhookEventType } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: any; // You can replace `any` with a specific type if you know the JWT payload structure
    }
  }
}
