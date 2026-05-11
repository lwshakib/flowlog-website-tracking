import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPresignedPutUrl } from "@/lib/s3";
import { USER_AVATAR_PREFIX } from "@/lib/user-image";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * POST /api/s3/presigned
 * Returns a presigned PUT URL and the object key to store on the user record after upload.
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { contentType?: string; sizeBytes?: number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const contentType = body.contentType?.trim() ?? "";
    if (!ALLOWED_TYPES.includes(contentType as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Invalid content type. Allowed: JPEG, PNG, WebP, GIF." },
        { status: 400 }
      );
    }

    if (typeof body.sizeBytes === "number" && body.sizeBytes > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 400 });
    }

    const ext = EXT[contentType] ?? "bin";
    const path = `${USER_AVATAR_PREFIX}${session.user.id}/${crypto.randomUUID()}.${ext}`;

    const uploadUrl = await getPresignedPutUrl(path, contentType);

    return NextResponse.json({
      uploadUrl,
      path,
      method: "PUT" as const,
      headers: { "Content-Type": contentType },
    });
  } catch (e) {
    console.error("[api/s3/presigned]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
