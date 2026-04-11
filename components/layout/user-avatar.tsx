"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { isPublicHttpImageUrl } from "@/lib/user-image";
import { Loader2, User } from "lucide-react";

function initialFromName(name: string | null | undefined): string {
  const t = (name ?? "").trim();
  if (!t) return "?";
  const ch = Array.from(t)[0];
  return ch ? ch.toUpperCase() : "?";
}

const sizeClasses = {
  sm: "size-10 text-sm",
  md: "size-14 sm:size-16 text-lg",
  lg: "size-20 sm:size-24 text-2xl",
} as const;

export type UserAvatarSize = keyof typeof sizeClasses;

type UserAvatarProps = {
  image: string | null | undefined;
  name: string | null | undefined;
  size?: UserAvatarSize;
  className?: string;
};

/**
 * Renders avatar: public HTTP URL as-is, or S3 key resolved via /api/s3/signed-url.
 * Otherwise shows first letter of name (fallback).
 */
export function UserAvatar({ image, name, size = "md", className }: UserAvatarProps) {
  const [signedSrc, setSignedSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isHttp = isPublicHttpImageUrl(image ?? undefined);
  const httpSrc = image && isHttp ? image.trim() : null;

  useEffect(() => {
    if (!image || isHttp) {
      setSignedSrc(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSignedSrc(null);

    fetch(`/api/s3/signed-url?path=${encodeURIComponent(image)}`, { credentials: "include" })
      .then(async (res) => {
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load image");
        if (!cancelled && data.url) setSignedSrc(data.url);
      })
      .catch(() => {
        if (!cancelled) setSignedSrc(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [image, isHttp]);

  const initial = initialFromName(name);
  const displaySrc = httpSrc || signedSrc;
  const showImage = Boolean(displaySrc);
  const showLoader = Boolean(image && !isHttp && loading);

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full border bg-muted flex items-center justify-center overflow-hidden font-semibold text-muted-foreground",
        sizeClasses[size],
        className
      )}
    >
      {showLoader && (
        <Loader2 className="absolute inset-0 m-auto size-5 animate-spin text-muted-foreground z-1" />
      )}
      {showImage && !showLoader && (
        <Image
          src={displaySrc!}
          alt=""
          fill
          className="object-cover"
          sizes={size === "sm" ? "40px" : size === "md" ? "64px" : "96px"}
          unoptimized
        />
      )}
      {!showImage && !showLoader && initial !== "?" && (
        <span className="text-foreground select-none z-0">{initial}</span>
      )}
      {!showImage && !showLoader && initial === "?" && (
        <User className="size-[45%] text-muted-foreground z-0" aria-hidden />
      )}
    </div>
  );
}
