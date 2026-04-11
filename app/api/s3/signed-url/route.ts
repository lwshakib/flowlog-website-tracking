import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { s3Service } from "@/services/s3.services";
import { USER_AVATAR_PREFIX } from "@/lib/user-image";

function isSafeKey(key: string): boolean {
  if (!key || key.length > 512) return false;
  if (key.includes("..") || key.startsWith("/")) return false;
  return true;
}

/**
 * GET /api/s3/signed-url?path=avatars/{userId}/...
 * Returns a short-lived presigned GET URL to display a private object.
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path")?.trim() ?? "";

    if (!path || !isSafeKey(path)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const allowedPrefix = `${USER_AVATAR_PREFIX}${session.user.id}/`;
    if (!path.startsWith(allowedPrefix)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = await s3Service.getPresignedGetUrl(path);

    return NextResponse.json({ url });
  } catch (e) {
    console.error("[api/s3/signed-url]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to sign URL" },
      { status: 500 }
    );
  }
}
