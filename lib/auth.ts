import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { Resend } from "resend";
import { AuthEmailTemplate } from "@/components/emails/auth-email-template";

/**
 * auth
 * @description The main Better-Auth instance for the server.
 * Connects to the PostgreSQL database via Prisma and enables various authentication methods.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Email/Password login configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const resend = new Resend(process.env.RESEND_API_KEY);
      try {
        const { error } = await resend.emails.send({
          from: "Flowlog <noreply@lwshakib.site>",
          to: user.email,
          subject: "Reset your password",
          react: AuthEmailTemplate({ type: "forgot-password", url }),
        });

        if (error) {
          console.error("Failed to send email via Resend:", error);
          throw new Error("Failed to send authentication email.");
        }
      } catch (err) {
        console.error("Resend error:", err);
        throw err;
      }
    },
  },
  // Social login configuration
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  // Email verification configuration
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const resend = new Resend(process.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: "Flowlog <noreply@lwshakib.site>",
          to: user.email,
          subject: "Verify your email address",
          react: AuthEmailTemplate({ type: "email-verification", url }),
        });
      } catch (err) {
        console.error("Verification email error:", err);
      }
    },
  },
  // Account management configurations
  account: {
    accountLinking: {
      enabled: true,
    },
  },
});
