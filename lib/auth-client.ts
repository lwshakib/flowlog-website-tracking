/**
 * @file lib/auth-client.ts
 * @description Client-side authentication utility using Better-Auth's React client.
 * Provides hooks and methods to interact with the authentication state in the browser.
 */

import { createAuthClient } from "better-auth/react";

/**
 * authClient
 * @description The main instance for client-side authentication interactions.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});

export const { useSession, listSessions } = authClient;
