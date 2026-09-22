import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "../db";
import { videoAsset } from "../schema/video";
import { eq } from "drizzle-orm";
import {
  VideoStorageProvider,
  VideoUploadParams,
  VideoUploadResult,
  VideoMetadata,
} from "./video-storage-provider";

// ============================================================================
// R2VideoStorageProvider — Cloudflare R2 implementation of VideoStorageProvider
// ============================================================================

export interface R2VideoStorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export class R2VideoStorageProvider implements VideoStorageProvider {
  private client: S3Client;
  private bucketName: string;

  constructor(config: R2VideoStorageConfig) {
    this.bucketName = config.bucketName;
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(params: VideoUploadParams): Promise<VideoUploadResult> {
    const videoId = crypto.randomUUID();
    const objectKey = `videos/${videoId}.mp4`;

    // Create DB record first (status: uploading)
    const [record] = await db
      .insert(videoAsset)
      .values({
        id: videoId,
        lessonId: params.lessonId,
        provider: "r2",
        providerAssetId: objectKey,
        objectKey,
        filename: params.filename,
        mimeType: params.mimeType,
        size: params.size,
        status: "uploading",
        uploadedBy: params.ownerId,
      })
      .returning();

    // Generate presigned upload URL (PUT request, 1 hour expiry)
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      ContentType: params.mimeType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 3600,
    });

    const expiresAt = new Date(Date.now() + 3600 * 1000);

    return {
      videoId: record.id,
      uploadUrl,
      objectKey,
      expiresAt,
    };
  }

  async getStreamUrl(videoId: string, expiresIn = 3600): Promise<string> {
    // Look up the video record to get the object key
    const records = await db
      .select()
      .from(videoAsset)
      .where(eq(videoAsset.id, videoId))
      .limit(1);

    const record = records[0];
    if (!record) {
      throw new Error("Video not found");
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: record.objectKey,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getMetadata(videoId: string): Promise<VideoMetadata> {
    const records = await db
      .select()
      .from(videoAsset)
      .where(eq(videoAsset.id, videoId))
      .limit(1);

    const record = records[0];
    if (!record) {
      throw new Error("Video not found");
    }

    return {
      id: record.id,
      filename: record.filename,
      mimeType: record.mimeType,
      size: record.size,
      duration: record.duration ?? undefined,
      status: record.status as "uploading" | "ready" | "failed",
    };
  }

  async delete(videoId: string): Promise<void> {
    // Look up the video record
    const records = await db
      .select()
      .from(videoAsset)
      .where(eq(videoAsset.id, videoId))
      .limit(1);

    const record = records[0];
    if (!record) {
      return; // Already deleted or doesn't exist
    }

    // Delete from R2
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: record.objectKey,
    });

    try {
      await this.client.send(command);
    } catch {
      // R2 deletion failed — orphan cleanup will handle it
      console.error(`Failed to delete video ${videoId} from R2`);
    }

    // Delete from DB
    await db.delete(videoAsset).where(eq(videoAsset.id, videoId));
  }

  /**
   * Mark a video as ready after successful upload.
   * Called by the client after confirming upload completion.
   */
  async markReady(videoId: string): Promise<void> {
    await db
      .update(videoAsset)
      .set({ status: "ready", updatedAt: new Date() })
      .where(eq(videoAsset.id, videoId));
  }

  /**
   * Mark a video as failed.
   */
  async markFailed(videoId: string): Promise<void> {
    await db
      .update(videoAsset)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(videoAsset.id, videoId));
  }
}
