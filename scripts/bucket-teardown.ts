/**
 * Delete all object versions (and delete markers), then delete the bucket.
 *
 * Usage: `bun run bucket:teardown`
 * Destructive — requires `.env` with the same credentials as setup.
 */
import "dotenv/config";
import {
  DeleteBucketCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  ListObjectVersionsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { createS3Client, requireBucketName } from "../lib/s3-client";

const BATCH = 1000;

async function deleteCurrentObjects(client: ReturnType<typeof createS3Client>, bucket: string) {
  let continuationToken: string | undefined;
  let total = 0;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        MaxKeys: BATCH,
      })
    );
    const keys = page.Contents?.map((c) => ({ Key: c.Key! })) ?? [];
    if (keys.length) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: keys, Quiet: true },
        })
      );
      total += keys.length;
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);
  if (total) console.log(`Deleted ${total} current object(s).`);
}

async function deleteAllVersionsAndMarkers(
  client: ReturnType<typeof createS3Client>,
  bucket: string
) {
  let keyMarker: string | undefined;
  let versionIdMarker: string | undefined;
  let total = 0;
  for (;;) {
    const out = await client.send(
      new ListObjectVersionsCommand({
        Bucket: bucket,
        KeyMarker: keyMarker,
        VersionIdMarker: versionIdMarker,
        MaxKeys: BATCH,
      })
    );
    const dels = [
      ...(out.Versions ?? []).map((v) => ({ Key: v.Key!, VersionId: v.VersionId! })),
      ...(out.DeleteMarkers ?? []).map((m) => ({ Key: m.Key!, VersionId: m.VersionId! })),
    ];
    if (dels.length) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: dels, Quiet: true },
        })
      );
      total += dels.length;
    }
    if (!out.IsTruncated) break;
    keyMarker = out.NextKeyMarker;
    versionIdMarker = out.NextVersionIdMarker;
  }
  if (total) console.log(`Deleted ${total} version(s) / delete marker(s).`);
}

async function main() {
  const bucket = requireBucketName();
  const client = createS3Client();

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    console.log(`Bucket "${bucket}" does not exist (or no access). Nothing to do.`);
    return;
  }

  console.log(`Emptying bucket: ${bucket}`);
  await deleteCurrentObjects(client, bucket);
  await deleteAllVersionsAndMarkers(client, bucket);

  await client.send(new DeleteBucketCommand({ Bucket: bucket }));
  console.log(`Bucket "${bucket}" deleted.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
