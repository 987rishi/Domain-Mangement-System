import { WebhookEventType } from "@prisma/client";


declare global {
  namespace Express {
    /**
     * Augments the global `Express.Request` interface to include a `user` property.
     * @remarks
     * This allows the `authMiddleware` to attach the decoded JWT payload directly to
     * the request object, making it accessible in a type-safe manner in subsequent
     * route handlers.
     */
    interface Request {
      /**
       * Holds the decoded JWT payload after successful authentication.
       * It is recommended to replace `any` with a specific interface describing the JWT payload structure.
       * @example { "id": 123, "role": "admin", "iat": 1616239022 }
       */
      user?: any;
    }
  }
}
declare global {
  namespace Express {
    interface Request {
      user?: any; // You can replace `any` with a specific type if you know the JWT payload structure
    }
  }
}
