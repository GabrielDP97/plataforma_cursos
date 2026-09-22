# ADR-008: Object Storage — Cloudflare R2

**Status**: ACCEPTED
**Date**: 2026-09-15
**Deciders**: Project Lead + AI Architecture Team

## Context

We need object storage for:
- Course resources (PDFs, code files, images)
- Video assets (MP4 files for MVP, potential Mux migration later)
- Zero-cost during MVP
- S3-compatible API for portability
- Private access (only authenticated, enrolled users)

## Decision

**Cloudflare R2** — shared bucket for files and video.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Cloudflare R2** | 10GB free, zero egress, S3-compatible | 10GB limit | **CHOSEN** |
| **AWS S3** | Industry standard, mature | Egress fees, complex pricing | REJECTED |
| **Supabase Storage** | Integrated with Supabase | Pauses with project | REJECTED |
| **Cloudinary** | Good for images, CDN | Paid for video, vendor lock-in | REJECTED |

## Rationale

1. **Zero egress is critical for LMS.** File downloads and video streaming generate significant egress. R2 charges zero. AWS S3 egress fees would blow the budget.
2. **10GB sufficient for MVP.** Text-heavy content (courses, lessons, progress) goes to Neon. Media (videos, PDFs, images) goes to R2. 15 courses × 75 videos × 50MB = 3.75GB. Plenty of room.
3. **S3-compatible API.** Easy migration to any S3-compatible provider if needed. No vendor lock-in at the API level.
4. **Private bucket.** All access via application authorization. No public URLs. R2 bucket permissions + application-level checks.
5. **Shared bucket.** Files under `files/` prefix, videos under `videos/` prefix. Single bucket, simple operations.

## Bucket Structure

```
lms-production/
├── files/
│   └── {course-id}/
│       └── {lesson-id}/
│           └── {uuid}.{ext}
└── videos/
    └── {uuid}.mp4
```

## Consequences

- **Positive**: Zero egress, simple operations, S3-compatible, shared bucket for files + video.
- **Negative**: 10GB limit may require upgrade for large courses with many video files.
- **Neutral**: R2 handles both general files and video objects. VideoProvider abstraction manages video-specific logic.
