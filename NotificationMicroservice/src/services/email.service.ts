import nodemailer from "nodemailer";
import { config } from "../config";
import { WebhookPayload , UserInfo} from "../types/webhook.types";
// Create a transporter object
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, 
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  // Optional: Add proxy, tls options etc. if needed
});

interface EmailOptions {
  to: string | string[]; // Recipient email address(es)
  subject: string;
  text?: string; // Plain text body
  html: string; // HTML body
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: config.email.from, // Sender address
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to, // List of receivers
      subject: options.subject, // Subject line
      text: options.text, // Plain text body (optional)
      html: options.html, // HTML body
    });
    console.log(`Email sent: ${info.messageId} to ${options.to}`);
  } catch (error) {
    console.error(`Error sending email to ${options.to}:`, error);
    // Consider more robust error handling/retries or logging to an external system
    throw error; // Re-throw to be handled by the controller
  }
};

// --- Helper to create email content based on event ---
// This should be much more sophisticated, using templates (e.g., Handlebars)
export const createEmailContent = (
  payload: WebhookPayload,
  recipientInfo: UserInfo
): EmailOptions => {
  const { eventType, data, triggeredBy } = payload;
  const subject = `Domain Management Update: ${eventType}`; // Simple subject

  let htmlBody = `<p>Dear ${recipientInfo.fname},</p>`;
  htmlBody += `<p>An update regarding domain <strong>${
    data.domainName || "N/A"
  }</strong> has occurred:</p>`;
  htmlBody += `<p><strong>Event:</strong> ${eventType}</p>`;

  if (triggeredBy) {
    htmlBody += `<p><strong>Action Performed By:</strong>${triggeredBy.role}</p>`; // Fetch name later
  }
  if (data.remarks) {
    htmlBody += `<p><strong>Remarks:</strong> ${data.remarks}</p>`;
  }
  // Add more details based on eventType
  htmlBody += `<p>Timestamp: ${new Date(
    payload.timestamp
  ).toLocaleString()}</p>`;
  htmlBody += `<p>Please log in to the Domain Management System for more details.</p>`; // Add link later

  return {
    to: recipientInfo.email,
    subject: subject,
    html: htmlBody,
  };
};
