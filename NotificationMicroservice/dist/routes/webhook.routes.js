"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyWebhook_1 = require("../middleware/verifyWebhook");
const webhook_controller_1 = require("../controllers/webhook.controller");
const apiRouter = (0, express_1.Router)();
// --- Webhook Endpoint ---
// POST /api/v1/notify/webhook
apiRouter.post("/notify/webhook", verifyWebhook_1.verifyWebhookSecret, webhook_controller_1.handleWebhook);
exports.default = apiRouter;
