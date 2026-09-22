// ============================================================================
// VideoStorageProvider Interface — Domain-level abstraction for video storage
// ============================================================================

export interface VideoStorageProvider {
  /**
   * Generate a presigned upload URL for direct-to-R2 video upload.
   * The client uploads directly to R2 (not through Worker memory).
   * @param params - Upload parameters
   * @returns VideoAsset with upload URL and metadata
   */
  upload(params: VideoUploadParams): Promise<VideoUploadResult>;

  /**
   * Generate a time-limited presigned URL for streaming a video.
   * The client streams directly from R2 using HTTP Range requests.
   * @param videoId - The video asset ID
   * @param expiresIn - URL expiry in seconds (default: 3600 = 1 hour)
   * @returns Presigned stream URL
   */
  getStreamUrl(videoId: string, expiresIn?: number): Promise<string>;

  /**
   * Get video metadata from storage.
   * @param videoId - The video asset ID
   * @returns VideoMetadata
   */
  getMetadata(videoId: string): Promise<VideoMetadata>;

  /**
   * Delete a video from storage.
   * @param videoId - The video asset ID
   */
  delete(videoId: string): Promise<void>;
}

export interface VideoUploadParams {
  lessonId: string;
  filename: string;
  mimeType: string;
  size: number;
  ownerId: string;
}

export interface VideoUploadResult {
  videoId: string;
  uploadUrl: string;
  objectKey: string;
  expiresAt: Date;
}

export interface VideoMetadata {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  duration?: number;
  status: "uploading" | "ready" | "failed";
}
