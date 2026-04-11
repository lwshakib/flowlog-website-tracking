/**
 * User `image` may be a public URL (e.g. Google OAuth) or an S3/R2 object key (e.g. avatars/userId/uuid.jpg).
 */
export function isPublicHttpImageUrl(value: string | null | undefined): boolean {
  if (!value || typeof value !== "string") return false;
  return /^https?:\/\//i.test(value.trim());
}

export const USER_AVATAR_PREFIX = "avatars/" as const;
