import { Resend } from "resend";
import type { EmailProvider, SendEmailParams } from "./email-provider";

// ResendEmailProvider — implements EmailProvider using Resend SDK
// Uses RESEND_API_KEY env var. From: configurable sender address.

export class ResendEmailProvider implements EmailProvider {
  private resend: Resend;
  private from: string;

  constructor(apiKey: string, from?: string) {
    this.resend = new Resend(apiKey);
    this.from = from || "onboarding@resend.dev"; // Resend default test sender
  }

  async send(params: SendEmailParams): Promise<{ id?: string }> {
    // Resend SDK returns { data, error } — does NOT throw on failure
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });

    if (error) {
      // Resend returned an error — propagate it
      throw new Error(
        `Resend error: ${error.name || "UNKNOWN"} — ${error.message || JSON.stringify(error)}`
      );
    }

    return { id: data?.id };
  }
}
