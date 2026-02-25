/**
 * @file app/api/auth/[...all]/route.ts
 * @description Catch-all route handler for Better-Auth.
 * Routes all authentication requests (sign-in, sign-up, session, etc.) to the Better-Auth handler.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
