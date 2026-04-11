import { S3Client } from "@aws-sdk/client-s3";

/**
 * `r2` — Cloudflare R2 (custom endpoint, path-style URLs).
 * `aws` — Amazon S3 (regional endpoint, virtual-hosted-style by default).
 *
 * If `S3_PROVIDER` is unset: `AWS_ENDPOINT` set → `r2`, else → `aws`.
 */
export type StorageProvider = "r2" | "aws";

export function resolveStorageProvider(): StorageProvider {
  const raw = process.env.S3_PROVIDER?.trim().toLowerCase();
  if (raw === "r2" || raw === "aws") {
    return raw;
  }
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
      throw new Error('For S3_PROVIDER=r2 (or when AWS_ENDPOINT is set), set AWS_ENDPOINT to your R2 S3 API URL.');
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
