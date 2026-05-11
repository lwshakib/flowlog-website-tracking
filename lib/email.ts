import { Resend } from "resend";
import { AuthEmailTemplate } from "@/components/emails/auth-email-template";

let client: Resend | null = null;

function getResendClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    client = new Resend(apiKey);
  }
  return client;
}

const from = process.env.RESEND_FROM ?? "Flowlog <noreply@lwshakib.site>";

export async function sendPasswordReset(to: string, url: string): Promise<void> {
  const { error } = await getResendClient().emails.send({
    from,
    to,
    subject: "Reset your password",
    react: AuthEmailTemplate({ type: "forgot-password", url }),
  });

  if (error) {
    console.error("Failed to send email via Resend:", error);
    throw new Error("Failed to send authentication email.");
  }
}

export async function sendEmailVerification(to: string, url: string): Promise<void> {
  const { error } = await getResendClient().emails.send({
    from,
    to,
    subject: "Verify your email address",
    react: AuthEmailTemplate({ type: "email-verification", url }),
  });

  if (error) {
    console.error("Verification email error:", error);
    throw new Error("Failed to send verification email.");
  }
}
