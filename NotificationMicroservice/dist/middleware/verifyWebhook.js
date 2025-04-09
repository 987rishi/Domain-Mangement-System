"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSecret = void 0;
const config_1 = require("../config");
// Add crypto import if using HMAC later
// import crypto from 'crypto';
const verifyWebhookSecret = (req, res, next) => {
    const providedSecret = req.headers["x-webhook-secret"];
    if (!config_1.config.webhookSecret) {
        console.error("Webhook secret is not configured on the server.");
        res
            .status(500)
            .send("Internal Server Error: Webhook secret not configured.");
        return;
    }
    if (!providedSecret || providedSecret !== config_1.config.webhookSecret) {
        console.warn(`Webhook Forbidden: Invalid or missing secret. Provided: ${providedSecret}`);
        res.status(403).send("Forbidden: Invalid webhook secret");
        return;
    }
    console.log("Webhook secret verified successfully.");
    next(); // Secret is valid, proceed to the next handler
};
exports.verifyWebhookSecret = verifyWebhookSecret;
// Add verifyWebhookSignature function here if using HMAC
