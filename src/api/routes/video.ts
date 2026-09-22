import { Hono } from "hono";
import { db } from "../../infra/db";
import { videoAsset } from "../../infra/schema/video";
import { lesson } from "../../infra/schema/content";
import { module } from "../../infra/schema/content";
import { enrollment } from "../../infra/schema/enrollment";
import { courseInstructors } from "../../infra/schema/ownership";
import { requireAuth } from "../middleware/auth";
import { MAX_VIDEO_SIZE } from "../../shared/constants";
import { ApiResponse } from "../../shared/types";
import { eq, and } from "drizzle-orm";
import { R2VideoStorageProvider } from "../../infra/providers/r2-video";

// ============================================================================
// Constants
// ============================================================================

/** Allowed MIME types for video uploads */
const ALLOWED_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm"]);

// ============================================================================
// Environment type for Hono context
// ============================================================================

type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
  Bindings: {
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET_NAME: string;
  };
};

// ============================================================================
// Routes
// ============================================================================

const videoRoutes = new Hono<Env>();

/**
 * POST /api/video — Upload a video
 *
 * - Authenticated + course ownership/collaborator required
 * - Validates MIME type, file size
 * - Creates videoAsset record (status: uploading)
 * - Generates presigned upload URL
 * - Returns upload URL + metadata
 */
videoRoutes.post("/", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string; role?: string };

    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const courseId = formData.get("courseId") as string | null;
    const lessonId = formData.get("lessonId") as string | null;

    if (!file || !courseId || !lessonId) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "file, courseId, and lessonId are required",
          },
        },
        400
      );
    }

    // Validate ownership
    const hasAccess = await isCourseMember(user.id, courseId);
    if (!hasAccess && user.role !== "admin") {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have access to this course",
          },
        },
        403
      );
    }

    // Validate lesson belongs to course
    const lessonRecord = await db
      .select()
      .from(lesson)
      .where(eq(lesson.id, lessonId))
      .limit(1);

    if (!lessonRecord[0]) {
      return c.json(
        {
          success: false,
          error: {
            code: "LESSON_NOT_FOUND",
            message: "Lesson not found",
          },
        },
        404
      );
    }

    const moduleRecord = await db
      .select()
      .from(module)
      .where(eq(module.id, lessonRecord[0].moduleId))
      .limit(1);

    if (!moduleRecord[0] || moduleRecord[0].courseId !== courseId) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Lesson does not belong to this course",
          },
        },
        400
      );
    }

    // Validate MIME type
    const contentType = file.type || "application/octet-stream";
    if (!ALLOWED_VIDEO_MIME_TYPES.has(contentType)) {
      return c.json(
        {
          success: false,
          error: {
            code: "INVALID_MIME_TYPE",
            message: `Invalid video type: ${contentType}. Allowed: video/mp4, video/webm`,
          },
        },
        415
      );
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      return c.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: `Video too large: ${file.size} bytes. Maximum: ${MAX_VIDEO_SIZE} bytes`,
          },
        },
        413
      );
    }

    // Get R2 config from environment
    const r2Config = {
      accountId: c.env.R2_ACCOUNT_ID,
      accessKeyId: c.env.R2_ACCESS_KEY_ID,
      secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      bucketName: c.env.R2_BUCKET_NAME,
    };

    const videoStorage = new R2VideoStorageProvider(r2Config);

    // Create video asset record and generate presigned upload URL
    const result = await videoStorage.upload({
      lessonId,
      filename: file.name,
      mimeType: contentType,
      size: file.size,
      ownerId: user.id,
    });

    const response: ApiResponse<{
      videoId: string;
      uploadUrl: string;
      expiresAt: Date;
    }> = {
      success: true,
      data: {
        videoId: result.videoId,
        uploadUrl: result.uploadUrl,
        expiresAt: result.expiresAt,
      },
    };

    return c.json(response, 201);
  } catch (error: any) {
    console.error("Video upload error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to initiate video upload",
        },
      },
      500
    );
  }
});

/**
 * GET /api/video/:videoId/stream — Stream a video
 *
 * - Authenticated + enrollment or instructor/admin required
 * - Generates presigned URL for direct R2 streaming
 * - Client streams directly from R2 using HTTP Range requests
 * - R2 supports Range requests natively — no Worker buffering needed
 */
videoRoutes.get("/:videoId/stream", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string; role?: string };
    const videoId = c.req.param("videoId")!;

    // Look up the video asset
    const records = await db
      .select()
      .from(videoAsset)
      .where(eq(videoAsset.id, videoId))
      .limit(1);

    const record = records[0];
    if (!record) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Video not found",
          },
        },
        404
      );
    }

    // Check video is ready
    if (record.status !== "ready") {
      return c.json(
        {
          success: false,
          error: {
            code: "VIDEO_NOT_READY",
            message: "Video is not ready for streaming",
          },
        },
        404
      );
    }

    // Get the course ID via lesson → module → course
    const lessonRecord = await db
      .select()
      .from(lesson)
      .where(eq(lesson.id, record.lessonId!))
      .limit(1);

    if (!lessonRecord[0]) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Lesson not found",
          },
        },
        404
      );
    }

    const moduleRecord = await db
      .select()
      .from(module)
      .where(eq(module.id, lessonRecord[0].moduleId))
      .limit(1);

    if (!moduleRecord[0]) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Module not found",
          },
        },
        404
      );
    }

    const courseId = moduleRecord[0].courseId;

    // Check access: enrollment OR instructor/admin
    const isEnrolled = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, user.id),
          eq(enrollment.courseId, courseId)
        )
      )
      .limit(1);

    const isInstructor = await db
      .select()
      .from(courseInstructors)
      .where(
        and(
          eq(courseInstructors.userId, user.id),
          eq(courseInstructors.courseId, courseId)
        )
      )
      .limit(1);

    if (
      !isEnrolled[0] &&
      !isInstructor[0] &&
      user.role !== "admin"
    ) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_ENROLLED",
            message: "You are not enrolled in this course",
          },
        },
        403
      );
    }

    // Generate presigned stream URL
    const r2Config = {
      accountId: c.env.R2_ACCOUNT_ID,
      accessKeyId: c.env.R2_ACCESS_KEY_ID,
      secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      bucketName: c.env.R2_BUCKET_NAME,
    };

    const videoStorage = new R2VideoStorageProvider(r2Config);
    const streamUrl = await videoStorage.getStreamUrl(videoId, 3600);

    const response: ApiResponse<{
      url: string;
      mimeType: string;
      size: number;
      duration?: number;
    }> = {
      success: true,
      data: {
        url: streamUrl,
        mimeType: record.mimeType,
        size: record.size,
        duration: record.duration ?? undefined,
      },
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Video stream error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate stream URL",
        },
      },
      500
    );
  }
});

/**
 * GET /api/video/:videoId — Get video metadata
 *
 * - Authenticated + enrollment or instructor/admin required
 */
videoRoutes.get("/:videoId", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string; role?: string };
    const videoId = c.req.param("videoId")!;

    // Look up the video asset
    const records = await db
      .select()
      .from(videoAsset)
      .where(eq(videoAsset.id, videoId))
      .limit(1);

    const record = records[0];
    if (!record) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Video not found",
          },
        },
        404
      );
    }

    // Get the course ID for access check
    const lessonRecord = await db
      .select()
      .from(lesson)
      .where(eq(lesson.id, record.lessonId!))
      .limit(1);

    if (!lessonRecord[0]) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Lesson not found",
          },
        },
        404
      );
    }

    const moduleRecord = await db
      .select()
      .from(module)
      .where(eq(module.id, lessonRecord[0].moduleId))
      .limit(1);

    if (!moduleRecord[0]) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Module not found",
          },
        },
        404
      );
    }

    const courseId = moduleRecord[0].courseId;

    // Check access
    const isEnrolled = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, user.id),
          eq(enrollment.courseId, courseId)
        )
      )
      .limit(1);

    const isInstructor = await db
      .select()
      .from(courseInstructors)
      .where(
        and(
          eq(courseInstructors.userId, user.id),
          eq(courseInstructors.courseId, courseId)
        )
      )
      .limit(1);

    if (
      !isEnrolled[0] &&
      !isInstructor[0] &&
      user.role !== "admin"
    ) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_ENROLLED",
            message: "You are not enrolled in this course",
          },
        },
        403
      );
    }

    const response: ApiResponse<{
      id: string;
      filename: string;
      mimeType: string;
      size: number;
      duration?: number;
      status: string;
      createdAt: Date;
    }> = {
      success: true,
      data: {
        id: record.id,
        filename: record.filename,
        mimeType: record.mimeType,
        size: record.size,
        duration: record.duration ?? undefined,
        status: record.status,
        createdAt: record.createdAt,
      },
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Video metadata error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get video metadata",
        },
      },
      500
    );
  }
});

/**
 * DELETE /api/video/:videoId — Delete a video
 *
 * - Authenticated + owner or admin required
 * - Deletes from R2 and DB
 */
videoRoutes.delete("/:videoId", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string; role?: string };
    const videoId = c.req.param("videoId")!;

    // Look up the video asset
    const records = await db
      .select()
      .from(videoAsset)
      .where(eq(videoAsset.id, videoId))
      .limit(1);

    const record = records[0];
    if (!record) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Video not found",
          },
        },
        404
      );
    }

    // Get the course ID for ownership check
    const lessonRecord = await db
      .select()
      .from(lesson)
      .where(eq(lesson.id, record.lessonId!))
      .limit(1);

    if (!lessonRecord[0]) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Lesson not found",
          },
        },
        404
      );
    }

    const moduleRecord = await db
      .select()
      .from(module)
      .where(eq(module.id, lessonRecord[0].moduleId))
      .limit(1);

    if (!moduleRecord[0]) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Module not found",
          },
        },
        404
      );
    }

    const courseId = moduleRecord[0].courseId;

    // Check ownership: owner or admin only
    const isOwner = await db
      .select()
      .from(courseInstructors)
      .where(
        and(
          eq(courseInstructors.userId, user.id),
          eq(courseInstructors.courseId, courseId)
        )
      )
      .limit(1);

    const isOwnerEntry =
      isOwner[0] && (isOwner[0] as any).role === "owner";

    if (!isOwnerEntry && user.role !== "admin") {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only course owners or admins can delete videos",
          },
        },
        403
      );
    }

    // Delete via video storage provider
    const r2Config = {
      accountId: c.env.R2_ACCOUNT_ID,
      accessKeyId: c.env.R2_ACCESS_KEY_ID,
      secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      bucketName: c.env.R2_BUCKET_NAME,
    };

    const videoStorage = new R2VideoStorageProvider(r2Config);
    await videoStorage.delete(videoId);

    return c.json({
      success: true,
      data: { message: "Video deleted successfully" },
    });
  } catch (error: any) {
    console.error("Video delete error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete video",
        },
      },
      500
    );
  }
});

/**
 * PATCH /api/video/:videoId/ready — Mark video as ready
 *
 * - Authenticated + owner or admin required
 * - Called after client confirms upload completion
 */
videoRoutes.patch("/:videoId/ready", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string; role?: string };
    const videoId = c.req.param("videoId")!;

    // Look up the video asset
    const records = await db
      .select()
      .from(videoAsset)
      .where(eq(videoAsset.id, videoId))
      .limit(1);

    const record = records[0];
    if (!record) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Video not found",
          },
        },
        404
      );
    }

    // Get the course ID for ownership check
    const lessonRecord = await db
      .select()
      .from(lesson)
      .where(eq(lesson.id, record.lessonId!))
      .limit(1);

    if (!lessonRecord[0]) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Lesson not found",
          },
        },
        404
      );
    }

    const moduleRecord = await db
      .select()
      .from(module)
      .where(eq(module.id, lessonRecord[0].moduleId))
      .limit(1);

    if (!moduleRecord[0]) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Module not found",
          },
        },
        404
      );
    }

    const courseId = moduleRecord[0].courseId;

    // Check ownership
    const isOwner = await db
      .select()
      .from(courseInstructors)
      .where(
        and(
          eq(courseInstructors.userId, user.id),
          eq(courseInstructors.courseId, courseId)
        )
      )
      .limit(1);

    const isOwnerEntry =
      isOwner[0] && (isOwner[0] as any).role === "owner";

    if (!isOwnerEntry && user.role !== "admin") {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only course owners or admins can update video status",
          },
        },
        403
      );
    }

    // Mark as ready
    const r2Config = {
      accountId: c.env.R2_ACCOUNT_ID,
      accessKeyId: c.env.R2_ACCESS_KEY_ID,
      secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      bucketName: c.env.R2_BUCKET_NAME,
    };

    const videoStorage = new R2VideoStorageProvider(r2Config);
    await videoStorage.markReady(videoId);

    const response: ApiResponse<{ id: string; status: string }> = {
      success: true,
      data: { id: videoId, status: "ready" },
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Video ready error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update video status",
        },
      },
      500
    );
  }
});

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if a user is a member of a course (owner or collaborator).
 */
async function isCourseMember(
  userId: string,
  courseId: string
): Promise<boolean> {
  const result = await db
    .select()
    .from(courseInstructors)
    .where(
      and(
        eq(courseInstructors.userId, userId),
        eq(courseInstructors.courseId, courseId)
      )
    )
    .limit(1);

  return !!result[0];
}

export default videoRoutes;
