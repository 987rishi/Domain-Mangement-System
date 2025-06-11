import { Request, Response, NextFunction } from "express";
import { config } from "../config";
// Add crypto import if using HMAC later
// import crypto from 'crypto';


/**
 * Middleware to protect webhook endpoints by verifying a shared secret.
 *
 * @remarks
 * This function provides a simple but effective layer of security for webhooks.
 * It checks for the presence of an `x-webhook-secret` header in the incoming request
 * and compares its value against the secret stored in the server's configuration.
 * This ensures that only trusted services that know the secret can trigger the webhook.
 *
 * @param req - The Express request object, expected to contain the `x-webhook-secret` header.
 * @param res - The Express response object.
 * @param next - The next middleware function to be called if verification is successful.
 * @returns Does not return a value but either sends an error response or calls `next()`.
 *
 * @example
 * ```
 * // Securing a webhook endpoint
 * router.post('/event', verifyWebhookSecret, handleWebhook);
 * ```
 */
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
