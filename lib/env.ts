/**
 * @file lib/env.ts
 * @description Centralized access to environmental variables with optional validation.
 */

/**
 * GOOGLE_API_KEY
 * @description API key used for various Google-related integrations.
 */
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
/**
 * RESEND_API_KEY
 * @description API key for the Resend email service.
 */
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
/**
 * TRUST_PROXY
 * @description Whether to trust X-Forwarded-For headers from reverse proxies.
 */
export const TRUST_PROXY = process.env.TRUST_PROXY === "true" || process.env.TRUST_PROXY === "1";
