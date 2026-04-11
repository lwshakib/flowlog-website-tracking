import { Resend } from "resend";
import { AuthEmailTemplate } from "@/components/emails/auth-email-template";

/**
 * Centralized transactional email sending via Resend.
 * Use the exported `emailService` singleton from server code (e.g. auth callbacks).
 */
export class EmailService {
  private client: Resend | null = null;

  private get resend(): Resend {
    if (!this.client) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error("RESEND_API_KEY is not set");
      }
      this.client = new Resend(apiKey);
    }
    return this.client;
  }

  private get from(): string {
    return process.env.RESEND_FROM ?? "Flowlog <noreply@lwshakib.site>";
  }

  async sendPasswordReset(to: string, url: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: "Reset your password",
      react: AuthEmailTemplate({ type: "forgot-password", url }),
    });

    if (error) {
      console.error("Failed to send email via Resend:", error);
      throw new Error("Failed to send authentication email.");
    }
  }

  async sendEmailVerification(to: string, url: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: "Verify your email address",
      react: AuthEmailTemplate({ type: "email-verification", url }),
    });

    if (error) {
      console.error("Verification email error:", error);
      throw new Error("Failed to send verification email.");
    }
  }
}

/** Initialized singleton — import this where you need to send mail. */
export const emailService = new EmailService();
