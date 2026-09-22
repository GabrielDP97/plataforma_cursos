import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  StorageProvider,
  StorageResult,
  StorageMetadata,
} from "./storage-provider";

// ============================================================================
// R2StorageProvider — Cloudflare R2 implementation of StorageProvider
// ============================================================================

export interface R2StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export class R2StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucketName: string;

  constructor(config: R2StorageConfig) {
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

  async upload(
    key: string,
    file: ReadableStream<Uint8Array>,
    contentType: string
  ): Promise<StorageResult> {
    // Convert ReadableStream to Uint8Array for S3 SDK
    const chunks: Uint8Array[] = [];
    const reader = file.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const body = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.client.send(command);

    return {
      key,
      size: body.length,
      contentType,
    };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  async getMetadata(key: string): Promise<StorageMetadata> {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.client.send(command);

    return {
      key,
      size: response.ContentLength ?? 0,
      contentType: response.ContentType ?? "application/octet-stream",
      lastModified: response.LastModified ?? new Date(),
    };
  }
}
