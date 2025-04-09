import { Request, Response, NextFunction } from "express";
import { config } from "../config";
// Add crypto import if using HMAC later
// import crypto from 'crypto';

export const verifyWebhookSecret = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const providedSecret = req.headers["x-webhook-secret"] as string;

  if (!config.webhookSecret) {
    console.error("Webhook secret is not configured on the server.");
     res
      .status(500)
      .send("Internal Server Error: Webhook secret not configured.");
      return;
  }

  if (!providedSecret || providedSecret !== config.webhookSecret) {
    console.warn(
      `Webhook Forbidden: Invalid or missing secret. Provided: ${providedSecret}`
    );
     res.status(403).send("Forbidden: Invalid webhook secret");
    return;
  }
  console.log("Webhook secret verified successfully.");
  next(); // Secret is valid, proceed to the next handler
};

// Add verifyWebhookSignature function here if using HMAC
