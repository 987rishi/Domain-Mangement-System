/**
 * @file Manages all email-related functionalities for the application.
 * This service uses Nodemailer to send transactional emails and includes helper
 * functions to construct email content from event payloads.
 * @author Your Name
 * @version 1.0.0
 */
import nodemailer from "nodemailer";
import { config } from "../config";
import { WebhookPayload, UserInfo } from "../types/webhook.types";
// Create a transporter object

/**
 * @internal
 * The Nodemailer transporter instance, configured with settings from the application config.
 * This object is responsible for the actual sending of emails.
 */
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

/**
 * Defines the structure for an email message to be sent.
 * @internal
 */
interface EmailOptions {
  /** Recipient email address or an array of addresses. */
  to: string | string[]; // Recipient email address(es)
  /** The subject line of the email. */
  subject: string;
  /** The plain text version of the email body. Optional. */
  text?: string; // Plain text body
  /** The HTML version of the email body. */
  html: string; // HTML body
}
/**
 * Sends an email using the pre-configured Nodemailer transporter.
 * This function handles the low-level details of dispatching the email.
 *
 * @param options - An object conforming to the {@link EmailOptions} interface, containing the email details.
 * @returns A promise that resolves when the email is successfully handed off to the SMTP server.
 * @throws Throws an error if the email fails to send, allowing the calling function to handle the failure.
 *
 * @example
 * ```
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   html: '<h1>Hello World</h1>'
 * });
 * ```
 */
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
/**
 * A helper function to generate standardized email content based on a webhook event.
 * It constructs the subject and HTML body for a notification email.
 *
 * @remarks
 * This is a basic implementation for generating email content. For more complex
 * or branded emails, this function should be enhanced to use a dedicated templating
 * engine like Handlebars, EJS, or Pug.
 *
 * @param payload - The webhook payload {@link WebhookPayload} containing details about the event that occurred.
 * @param recipientInfo - Information {@link UserInfo} about the user who will receive the email, including their name and email address.
 * @returns An {@link EmailOptions} object, ready to be passed to the `sendEmail` function.
 */
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
