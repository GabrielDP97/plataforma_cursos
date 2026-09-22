import type { EmailProvider } from "../providers/email-provider";

// EmailService — high-level email operations with templates
// Domain code calls this, NOT the EmailProvider directly.

export class EmailService {
  constructor(private provider: EmailProvider) {}

  async sendWelcome(email: string, name: string): Promise<void> {
    try {
      await this.provider.send({
        to: email,
        subject: "Welcome to AulaDev",
        html: welcomeTemplate(name),
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Don't throw — email failure shouldn't block user registration
    }
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    try {
      await this.provider.send({
        to: email,
        subject: "Reset your password",
        html: passwordResetTemplate(resetUrl),
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  }

  async sendEnrollmentConfirmation(
    email: string,
    courseName: string
  ): Promise<void> {
    try {
      await this.provider.send({
        to: email,
        subject: `Enrolled in "${courseName}"`,
        html: enrollmentConfirmationTemplate(courseName),
      });
    } catch (error) {
      console.error("Failed to send enrollment confirmation email:", error);
    }
  }

  async sendAnnouncement(
    email: string,
    courseName: string,
    title: string,
    message: string
  ): Promise<void> {
    try {
      await this.provider.send({
        to: email,
        subject: `[${courseName}] ${title}`,
        html: announcementTemplate(courseName, title, message),
      });
    } catch (error) {
      console.error("Failed to send announcement email:", error);
    }
  }
}

// ============================================================================
// HTML Templates
// ============================================================================

function welcomeTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to AulaDev!</h1>
      </div>
      <div class="content">
        <p>Hi ${escapeHtml(name)},</p>
        <p>Your account has been created successfully. You can now browse courses, enroll, and start learning.</p>
        <a href="${getBaseUrl()}/catalog" class="button">Browse Courses</a>
        <p>If you have any questions, feel free to reach out to our support team.</p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

function passwordResetTemplate(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <p>You requested a password reset for your AulaDev account.</p>
        <p>Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

function enrollmentConfirmationTemplate(courseName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Enrollment Confirmed</h1>
      </div>
      <div class="content">
        <p>You have been enrolled in <strong>${escapeHtml(courseName)}</strong>.</p>
        <p>You can now access all course materials. Start learning at your own pace.</p>
        <a href="${getBaseUrl()}/catalog" class="button">Go to Dashboard</a>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

function announcementTemplate(
  courseName: string,
  title: string,
  message: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${escapeHtml(courseName)}</h1>
      </div>
      <div class="content">
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// Utilities
// ============================================================================

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getBaseUrl(): string {
  // In production, this would come from env vars
  // For MVP, return a sensible default
  return process.env.APP_URL || "https://lms-platform.com";
}
