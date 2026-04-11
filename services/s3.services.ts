import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 (S3-compatible) — presigned PUT for uploads, presigned GET for reads.
 * Configure via AWS_* env vars (see `.env.example`).
 */
export class S3Service {
  private client: S3Client | null = null;

  private getClient(): S3Client {
    if (!this.client) {
      const region = process.env.AWS_REGION ?? "auto";
      const endpoint = process.env.AWS_ENDPOINT;
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      if (!endpoint || !accessKeyId || !secretAccessKey) {
        throw new Error("S3/R2 is not configured: set AWS_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.");
      }
      this.client = new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
      });
    }
    return this.client;
  }

  private getBucket(): string {
    const name = process.env.AWS_S3_BUCKET_NAME;
    if (!name) {
      throw new Error("AWS_S3_BUCKET_NAME is not set.");
    }
    return name;
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
