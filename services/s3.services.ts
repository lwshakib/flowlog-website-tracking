import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client, requireBucketName, resolveStorageProvider } from "@/lib/s3-client";
import type { S3Client } from "@aws-sdk/client-s3";

/**
 * Object storage: **Cloudflare R2** or **Amazon S3** (see `S3_PROVIDER` / `lib/s3-client.ts`).
 */
export class S3Service {
  private client: S3Client | null = null;

  private getClient(): S3Client {
    if (!this.client) {
      this.client = createS3Client();
    }
    return this.client;
  }

  private getBucket(): string {
    return requireBucketName();
  }

  /** Which backend is active (for logging / diagnostics). */
  get provider(): ReturnType<typeof resolveStorageProvider> {
    return resolveStorageProvider();
  }

  async getPresignedPutUrl(key: string, contentType: string, expiresIn = 600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.getBucket(),
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.getClient(), command, { expiresIn });
  }

  async getPresignedGetUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.getBucket(),
      Key: key,
    });
    return getSignedUrl(this.getClient(), command, { expiresIn });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.getBucket(),
      Key: key,
    });
    await this.getClient().send(command);
  }
}

export const s3Service = new S3Service();
