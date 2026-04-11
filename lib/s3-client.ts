import { S3Client } from "@aws-sdk/client-s3";

/**
 * If `AWS_ENDPOINT` is set, we assume S3-compatible storage like Cloudflare R2
 * (which requires path-style URLs). Otherwise, we assume standard Amazon S3.
 */
export type StorageProvider = "r2" | "aws";

export function resolveStorageProvider(): StorageProvider {
  return process.env.AWS_ENDPOINT?.trim() ? "r2" : "aws";
}

/**
 * Shared factory for the app and for `scripts/bucket-*.ts`.
 */
export function createS3Client(): S3Client {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.");
  }

  const provider = resolveStorageProvider();

  if (provider === "r2") {
    const endpoint = process.env.AWS_ENDPOINT?.trim();
    if (!endpoint) {
      throw new Error("AWS_ENDPOINT is required for the R2 storage provider.");
    }
    return new S3Client({
      region: process.env.AWS_REGION?.trim() || "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }

  const region = process.env.AWS_REGION?.trim() || "us-east-1";
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function requireBucketName(): string {
  const name = process.env.AWS_S3_BUCKET_NAME?.trim();
  if (!name) {
    throw new Error("Set AWS_S3_BUCKET_NAME.");
  }
  return name;
}
