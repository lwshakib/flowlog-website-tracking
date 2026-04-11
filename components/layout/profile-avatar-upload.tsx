"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { UserAvatar, type UserAvatarSize } from "@/components/layout/user-avatar";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

type ProfileAvatarUploadProps = {
  image: string | null | undefined;
  name: string | null | undefined;
  size?: UserAvatarSize;
  className?: string;
  onUploaded?: () => void | Promise<void>;
};

/**
 * Profile avatar with hover camera control: presigned PUT upload, then `user.image` stores the S3 key only.
 */
export function ProfileAvatarUpload({
  image,
  name,
  size = "md",
  className,
  onUploaded,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const openPicker = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPT.split(",").includes(file.type)) {
      toast.error("Use a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const presign = await fetch("/api/s3/presigned", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, sizeBytes: file.size }),
      });

      const presignJson = (await presign.json()) as {
        uploadUrl?: string;
        path?: string;
        error?: string;
        headers?: { "Content-Type"?: string };
      };

      if (!presign.ok) {
        toast.error(presignJson.error || "Could not start upload.");
        return;
      }

      const { uploadUrl, path } = presignJson;
      if (!uploadUrl || !path) {
        toast.error("Invalid response from server.");
        return;
      }

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!putRes.ok) {
        toast.error("Upload to storage failed.");
        return;
      }

      const { error } = await authClient.updateUser({ image: path });
      if (error) {
        toast.error(error.message || "Failed to save profile image.");
        return;
      }

      toast.success("Profile photo updated.");
      await onUploaded?.();
    } catch {
      toast.error("Something went wrong while uploading.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("relative inline-flex group", className)}>
      <UserAvatar image={image} name={name} size={size} />

      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        className={cn(
          "absolute inset-0 z-10 flex items-center justify-center rounded-full",
          "bg-black/50 text-white opacity-0 transition-opacity",
          "group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
          uploading && "opacity-100 cursor-wait"
        )}
        aria-label="Upload profile photo"
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <Camera className="size-6" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onChange={onFileChange}
        aria-hidden
      />
    </div>
  );
}
