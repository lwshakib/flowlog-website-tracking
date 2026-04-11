import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { emailService } from "@/services/email.services";

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
      try {
        await emailService.sendPasswordReset(user.email, url);
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
      try {
        await emailService.sendEmailVerification(user.email, url);
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
