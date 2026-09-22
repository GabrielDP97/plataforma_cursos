// ============================================================================
// StorageProvider Interface — Domain-level abstraction for file storage
// ============================================================================

export interface StorageProvider {
  /**
   * Upload a file to storage.
   * @param key - Server-generated object key (UUID-based, never user filenames)
   * @param file - The file content as a ReadableStream
   * @param contentType - MIME type of the file
   * @returns StorageResult with key, size, and contentType
   */
  upload(
    key: string,
    file: ReadableStream<Uint8Array>,
    contentType: string
  ): Promise<StorageResult>;

  /**
   * Generate a time-limited signed URL for accessing a stored object.
   * @param key - The object key in storage
   * @param expiresIn - URL expiry in seconds (default: 3600 = 1 hour)
   * @returns Signed URL string
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Delete an object from storage.
   * @param key - The object key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Get metadata about a stored object.
   * @param key - The object key
   * @returns StorageMetadata with key, size, contentType, lastModified
   */
  getMetadata(key: string): Promise<StorageMetadata>;
}

export interface StorageResult {
  key: string;
  size: number;
  contentType: string;
}

export interface StorageMetadata {
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
}
