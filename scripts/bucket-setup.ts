/**
 * Create the bucket (if missing), tighten public access (AWS), and set CORS for browser uploads.
 *
 * Usage: `bun run bucket:setup`
 * Requires `.env` with credentials and `AWS_S3_BUCKET_NAME` (see `.env.example`).
 */
import "dotenv/config";
import {
  CreateBucketCommand,
  type BucketLocationConstraint,
  type CreateBucketCommandInput,
  HeadBucketCommand,
  PutBucketCorsCommand,
  PutPublicAccessBlockCommand,
} from "@aws-sdk/client-s3";
import { createS3Client, requireBucketName, resolveStorageProvider } from "../lib/s3-client";

async function main() {
  const provider = resolveStorageProvider();
  const bucket = requireBucketName();
  const client = createS3Client();

  console.log(`Storage provider: ${provider}`);
  console.log(`Bucket: ${bucket}`);

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log("Bucket already exists — skipping create.");
  } catch (e: unknown) {
    const err = e as { name?: string; $metadata?: { httpStatusCode?: number } };
    const notFound =
      err.name === "NotFound" ||
      err.name === "NoSuchBucket" ||
      err.$metadata?.httpStatusCode === 404;
    if (!notFound) {
      throw e;
    }

    const input: CreateBucketCommandInput = { Bucket: bucket };
    if (provider === "aws") {
      const region = process.env.AWS_REGION?.trim() || "us-east-1";
      if (region !== "us-east-1") {
        input.CreateBucketConfiguration = {
          LocationConstraint: region as BucketLocationConstraint,
        };
      }
    }
    await client.send(new CreateBucketCommand(input));
    console.log("Bucket created.");
  }

  if (provider === "aws") {
    try {
      await client.send(
        new PutPublicAccessBlockCommand({
          Bucket: bucket,
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            IgnorePublicAcls: true,
            BlockPublicPolicy: true,
            RestrictPublicBuckets: true,
          },
        })
      );
      console.log("AWS S3 public access block applied.");
    } catch (e) {
      console.warn("Could not set public access block (may lack permission):", e);
    }
  }

  const appOrigin = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "http://localhost:3000";
  try {
    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              ID: "flowlog-avatars",
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "HEAD"],
              AllowedOrigins: [appOrigin],
              ExposeHeaders: ["ETag", "Content-Length"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );
    console.log(`CORS updated for origin: ${appOrigin}`);
  } catch (e) {
    console.warn("Could not set CORS (configure manually in dashboard if needed):", e);
  }

  console.log("bucket:setup finished.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
