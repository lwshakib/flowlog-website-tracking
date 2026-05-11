import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client, requireBucketName, resolveStorageProvider } from "@/lib/s3-client";
import type { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = createS3Client();
  }
  return client;
}

function getBucket(): string {
  return requireBucketName();
}

/** Which backend is active (for logging / diagnostics). */
export function getStorageProvider(): ReturnType<typeof resolveStorageProvider> {
  return resolveStorageProvider();
}

export async function getPresignedPutUrl(key: string, contentType: string, expiresIn = 600): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), command, { expiresIn });
}

export async function getPresignedGetUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  return getSignedUrl(getClient(), command, { expiresIn });
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  await getClient().send(command);
}
