// EmailProvider interface — abstraction over email sending services
// Domain code depends on this, NOT on ResendEmailProvider directly.

export interface EmailProvider {
  send(params: SendEmailParams): Promise<{ id?: string }>;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}
