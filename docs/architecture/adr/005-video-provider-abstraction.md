# ADR-005: Video Strategy — R2 MVP with VideoStorageProvider Abstraction

**Status**: ACCEPTED
**Date**: 2026-09-15
**Deciders**: Project Lead + AI Architecture Team

## Context

We need video hosting for an LMS platform with:
- Zero-cost constraint during MVP
- Course lessons with video content (15 courses × 3-5 lessons = 45-75 video files)
- Future migration to professional streaming (adaptive bitrate, analytics)
- Private access — only enrolled students can view
- No vendor lock-in in domain logic
- Domain services must NOT depend directly on R2 SDK

## Decision

**Cloudflare R2 + MP4 + HTTP Range Requests** for MVP. `VideoStorageProvider` abstraction for future migration.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Cloudflare R2 + MP4** | Free, >10 assets, private, simple, portable, S3-compatible | No adaptive bitrate, no transcoding, no analytics | **CHOSEN (MVP)** |
| **Mux Free** | Great API, adaptive streaming, 100K min/mo | 10 videos only, no spend cap | REJECTED (too restrictive) |
| **Cloudflare Stream** | Cloudflare-native, adaptive streaming | $5/mo minimum | REJECTED (not free) |
| **YouTube unembedded** | Free, unlimited | No access control, ToS risk | REJECTED |

## Rationale

1. **Mux Free 10-video limit is a hard bottleneck.** 15 courses × 3-5 lessons = 45-75 videos needed. Mux can only serve 10. This eliminates Mux for MVP.
2. **R2 provides zero-cost, unlimited assets** within 10GB. Average video at 50MB × 75 videos = 3.75GB — well within limits.
3. **Private access via application authorization.** R2 bucket is private. Video stream URL generated server-side after enrollment check. No public access.
4. **HTTP Range for seeking.** MP4 files support Range requests natively. Students can seek to any point without loading the full video.
5. **VideoStorageProvider abstraction** means zero domain logic changes when migrating to Mux later. Course/Module/Lesson only know VideoAsset, not the provider.
6. **Trade-off accepted**: Basic playback (MP4 + Range) vs professional streaming (adaptive bitrate, analytics). Acceptable for MVP.

## Architecture

```
VideoStorageProvider (interface)
├── R2VideoStorageProvider   ← MVP (Cloudflare R2 + MP4 + Range)
└── MuxVideoStorageProvider  ← FUTURE (adaptive streaming, analytics)
```

**Critical rule**: Domain services (`src/domains/`) depend on `VideoStorageProvider` (the interface). Infrastructure adapters (`src/infra/`) implement the interface. The domain NEVER imports R2 SDK, Mux SDK, or any provider-specific code.

## Interface

```typescript
interface VideoStorageProvider {
  upload(params: VideoUploadParams): Promise<VideoAsset>;
  getStreamUrl(videoId: string, userId: string): Promise<string>;
  getMetadata(videoId: string): Promise<VideoMetadata>;
  delete(videoId: string): Promise<void>;
}

interface VideoUploadParams {
  fileId: string;
  filename: string;
  mimeType: string;
  size: number;
  ownerId: string;
}
```

## Video Security

- **Private bucket**: R2 bucket is never public. All access via application API.
- **Auth → Enrollment check → R2 stream**: Every video request goes through authentication, then enrollment verification, then R2 stream URL generation.
- **HTTP Range for seeking**: Students can seek without buffering full video.
- **Stream, never buffer**: Video content streamed via Range requests. Never load full video in Worker memory.
- **Internal IDs**: Object keys use structured paths (`courses/{courseId}/lessons/{lessonId}/assets/{assetId}`), not user filenames. No path traversal, no naming conflicts.

## Video Upload

- **Direct-to-R2 streaming**: Upload goes directly to R2 (not through Worker memory). Worker handles metadata and authorization only.
- **Verify**: File size, MIME type, ownership, authorization — all checked before accepting upload.
- **Object key generation**: Internal UUID-based key, never user-provided filename.
- **Size limits**: `MAX_VIDEO_SIZE` constant (default 500MB, configurable per environment).
- **Metadata**: Stored in VideoAsset table with provider, objectKey, filename, mimeType, size, duration, status.

## Data Model

```typescript
interface VideoAsset {
  id: string;              // UUID
  provider: 'r2' | 'mux';
  providerAssetId: string; // R2 object key or Mux asset ID
  objectKey: string;       // Internal storage path
  filename: string;        // Original filename (for display only)
  mimeType: string;
  size: number;            // bytes
  duration?: number;       // seconds, if available
  status: 'uploading' | 'ready' | 'failed';
  createdAt: Date;
}
```

## Consequences

- **Positive**: Free video hosting, unlimited assets (within 10GB), private access, provider-agnostic domain logic, easy migration path.
- **Negative**: No adaptive bitrate (MP4 only), no transcoding, no video analytics. Acceptable for MVP.
- **Neutral**: R2 handles both general files and video objects (shared bucket, different prefixes). VideoStorageProvider abstraction manages video-specific logic.

## Future Migration

R2VideoStorageProvider → MuxVideoStorageProvider. LMS domain only knows VideoAsset. No changes to Course/Module/Lesson. Interface stays the same, implementation swaps.
