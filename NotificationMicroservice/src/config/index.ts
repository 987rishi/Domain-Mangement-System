import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3001,
  webhookSecret: process.env.WEBHOOK_SECRET || "",
  email: {
    host: process.env.EMAIL_HOST || "",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
    from: process.env.EMAIL_FROM || "",
  },
  userService: {
    // Example if calling User Service
    apiUrl: process.env.USER_SERVICE_API_URL,
    apiKey: process.env.USER_SERVICE_API_KEY,
  },
};

// Basic validation
if (!config.webhookSecret) {
  console.error("FATAL ERROR: WEBHOOK_SECRET is not defined in .env");
  process.exit(1);
}
if (!config.email.user || !config.email.pass || !config.email.host) {
  console.warn("WARN: Email configuration might be incomplete in .env");
}
