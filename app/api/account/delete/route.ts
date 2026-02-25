import { auth } from "@/lib/auth"; // Core better-auth backend validation client
import { headers } from "next/headers"; // Next.js API for dynamically parsing request headers
import { NextResponse } from "next/server"; // Next.js uniform response builder
import prisma from "@/lib/prisma"; // Global Prisma ORM instance

/**
 * DELETE Handler
 * API route for self-account deletion.
 * Securely and permanently deletes the authenticated user from the local PostgreSQL database.
 */
export async function DELETE() {
  try {
    // Extract and parse session state synchronously from the incoming request's cookie headers
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check constraint: Block the action if the request lacked an active session entirely
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Directly execute a destructive delete mapped to the user's primary ID using Prisma.
    // NOTE: Prisma will handle referential integrity and perform a cascade deletion of
    // all linked relations (sessions, accounts, timezones, tasks, etc.)
    // because we explicitly configured `onDelete: Cascade` inside the schema.prisma definition file.
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
