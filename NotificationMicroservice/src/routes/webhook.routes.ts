import { Router } from "express";
import { verifyWebhookSecret } from "../middleware/verifyWebhook";
import { handleWebhook } from "../controllers/webhook.controller";
const apiRouter = Router();
// --- Webhook Endpoint ---
// POST /api/v1/notify/webhook
apiRouter.post("/notify/webhook", verifyWebhookSecret, handleWebhook);

export default apiRouter;