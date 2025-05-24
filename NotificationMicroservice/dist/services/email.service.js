"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailContent = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
// Create a transporter object
const transporter = nodemailer_1.default.createTransport({
    host: config_1.config.email.host,
    port: config_1.config.email.port,
    secure: config_1.config.email.secure,
    auth: {
        user: config_1.config.email.user,
        pass: config_1.config.email.pass,
    },
    // Optional: Add proxy, tls options etc. if needed
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const info = yield transporter.sendMail({
            from: config_1.config.email.from, // Sender address
            to: Array.isArray(options.to) ? options.to.join(", ") : options.to, // List of receivers
            subject: options.subject, // Subject line
            text: options.text, // Plain text body (optional)
            html: options.html, // HTML body
        });
        console.log(`Email sent: ${info.messageId} to ${options.to}`);
    }
    catch (error) {
        console.error(`Error sending email to ${options.to}:`, error);
        // Consider more robust error handling/retries or logging to an external system
        throw error; // Re-throw to be handled by the controller
    }
});
exports.sendEmail = sendEmail;
// --- Helper to create email content based on event ---
// This should be much more sophisticated, using templates (e.g., Handlebars)
const createEmailContent = (payload, recipientInfo) => {
    const { eventType, data, triggeredBy } = payload;
    const subject = `Domain Management Update: ${eventType}`; // Simple subject
    let htmlBody = `<p>Dear ${recipientInfo.fname},</p>`;
    htmlBody += `<p>An update regarding domain <strong>${data.domainName || "N/A"}</strong> has occurred:</p>`;
    htmlBody += `<p><strong>Event:</strong> ${eventType}</p>`;
    if (triggeredBy) {
        htmlBody += `<p><strong>Action Performed By:</strong>${triggeredBy.role}</p>`; // Fetch name later
    }
    if (data.remarks) {
        htmlBody += `<p><strong>Remarks:</strong> ${data.remarks}</p>`;
    }
    // Add more details based on eventType
    htmlBody += `<p>Timestamp: ${new Date(payload.timestamp).toLocaleString()}</p>`;
    htmlBody += `<p>Please log in to the Domain Management System for more details.</p>`; // Add link later
    return {
        to: recipientInfo.email,
        subject: subject,
        html: htmlBody,
    };
};
exports.createEmailContent = createEmailContent;
