import { Hono } from "hono";
import { db } from "../../infra/db";
import { resource, lesson, module } from "../../infra/schema/content";
import { enrollment } from "../../infra/schema/enrollment";
import { courseInstructors } from "../../infra/schema/ownership";
import { requireAuth } from "../middleware/auth";
import { MAX_FILE_SIZE } from "../../shared/constants";
import { ApiResponse } from "../../shared/types";
import { eq, and } from "drizzle-orm";
import { R2StorageProvider } from "../../infra/providers/r2-storage";

// ============================================================================
// Constants
// ============================================================================

/** Allowed MIME types for file uploads */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "text/plain",
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
  "application/zip",
]);

/** Allowed file extensions */
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".txt",
  ".html",
  ".css",
  ".js",
  ".ts",
  ".zip",
]);

// ============================================================================
// Helpers
// ============================================================================

/**
 * Sanitize a filename for safe use in Content-Disposition header.
 * Removes path separators, null bytes, and control characters.
 */
function sanitizeFilename(filename: string): string {
  return filename
    // eslint-disable-next-line no-useless-escape
    .replace(/[\/\\]/g, "") // Remove path separators
    .replace(/\.\./g, "") // Remove parent directory references
    // eslint-disable-next-line no-control-regex
    .replace(/\x00/g, "") // Remove null bytes
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x7f]/g, "") // Remove control characters
    .trim();
}

/**
 * Get file extension from filename (lowercase, with dot).
 */
function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Generate a UUID-based object key for file storage.
 * Convention: courses/{courseId}/lessons/{lessonId}/assets/{uuid}.{ext}
 */
function generateObjectKey(
  courseId: string,
  lessonId: string,
  filename: string
): string {
  const assetId = crypto.randomUUID();
  const ext = getExtension(filename);
  return `courses/${courseId}/lessons/${lessonId}/assets/${assetId}${ext}`;
}

/**
 * Validate upload request before accepting.
 */
function validateUpload(
  contentType: string,
  filename: string,
  contentLength: number
): { valid: boolean; error?: string } {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    return {
      valid: false,
      error: `Invalid MIME type: ${contentType}. Allowed types: ${Array.from(ALLOWED_MIME_TYPES).join(", ")}`,
    };
  }

  // Check extension
  const ext = getExtension(filename);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Invalid file extension: ${ext}. Allowed extensions: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`,
    };
  }

  // Check file size
  if (contentLength > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${contentLength} bytes. Maximum: ${MAX_FILE_SIZE} bytes`,
    };
  }

  // Check for path traversal in filename
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return {
      valid: false,
      error: "Invalid filename: path traversal detected",
    };
  }

  return { valid: true };
}

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

const fileRoutes = new Hono<Env>();

/**
 * POST /api/files — Upload a file
 *
 * - Authenticated + course ownership/collaborator required
 * - Validates MIME type, extension, file size
 * - Generates UUID-based object key
 * - Creates resource record in DB
 * - Uploads to R2
 * - Returns metadata
 */
fileRoutes.post("/", requireAuth, async (c) => {
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

    // Validate upload
    const contentType = file.type || "application/octet-stream";
    const validation = validateUpload(
      contentType,
      file.name,
      file.size
    );

    if (!validation.valid) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validation.error,
          },
        },
        400
      );
    }

    // Generate object key
    const objectKey = generateObjectKey(courseId, lessonId, file.name);

    // Get R2 config from environment
    const r2Config = {
      accountId: c.env.R2_ACCOUNT_ID,
      accessKeyId: c.env.R2_ACCESS_KEY_ID,
      secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      bucketName: c.env.R2_BUCKET_NAME,
    };

    const storage = new R2StorageProvider(r2Config);

    // Convert File to ReadableStream (use Workers-compatible global type)
    const fileStream = file.stream();

    // Upload to R2
    const result = await storage.upload(objectKey, fileStream, contentType);

    // Create DB record
    const [record] = await db
      .insert(resource)
      .values({
        lessonId,
        filename: sanitizeFilename(file.name),
        objectKey,
        mimeType: contentType,
        size: result.size,
      })
      .returning();

    const response: ApiResponse<typeof record> = {
      success: true,
      data: record,
    };

    return c.json(response, 201);
  } catch (error: any) {
    console.error("File upload error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to upload file",
        },
      },
      500
    );
  }
});

/**
 * GET /api/files/:fileId/download — Download a file
 *
 * - Authenticated + enrollment or instructor/admin required
 * - Generates signed URL with Content-Disposition header
 */
fileRoutes.get("/:fileId/download", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string; role?: string };
    const fileId = c.req.param("fileId")!;

    // Look up the resource
    const records = await db
      .select()
      .from(resource)
      .where(eq(resource.id, fileId))
      .limit(1);

    const record = records[0];
    if (!record) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "File not found",
          },
        },
        404
      );
    }

    // Get the lesson → module → course hierarchy
    const lessonRecord = await db
      .select()
      .from(lesson)
      .where(eq(lesson.id, record.lessonId))
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

    // Generate signed URL
    const r2Config = {
      accountId: c.env.R2_ACCOUNT_ID,
      accessKeyId: c.env.R2_ACCESS_KEY_ID,
      secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      bucketName: c.env.R2_BUCKET_NAME,
    };

    const storage = new R2StorageProvider(r2Config);
    const signedUrl = await storage.getSignedUrl(record.objectKey, 3600);

    // Generate safe filename for Content-Disposition
    const safeFilename = sanitizeFilename(record.filename);

    const response: ApiResponse<{
      url: string;
      filename: string;
      contentType: string;
      size: number;
    }> = {
      success: true,
      data: {
        url: signedUrl,
        filename: safeFilename,
        contentType: record.mimeType,
        size: record.size,
      },
    };

    return c.json(response);
  } catch (error: any) {
    console.error("File download error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate download URL",
        },
      },
      500
    );
  }
});

/**
 * DELETE /api/files/:fileId — Delete a file
 *
 * - Authenticated + owner or admin required
 * - Deletes from R2 and DB
 */
fileRoutes.delete("/:fileId", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string; role?: string };
    const fileId = c.req.param("fileId")!;

    // Look up the resource
    const records = await db
      .select()
      .from(resource)
      .where(eq(resource.id, fileId))
      .limit(1);

    const record = records[0];
    if (!record) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "File not found",
          },
        },
        404
      );
    }

    // Get the course hierarchy for ownership check
    const lessonRecord = await db
      .select()
      .from(lesson)
      .where(eq(lesson.id, record.lessonId))
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

    // Check ownership: owner or admin only (collaborators CANNOT delete)
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
            message: "Only course owners or admins can delete files",
          },
        },
        403
      );
    }

    // Delete from R2 (compensation: if R2 fails, orphan cleanup handles it)
    const r2Config = {
      accountId: c.env.R2_ACCOUNT_ID,
      accessKeyId: c.env.R2_ACCESS_KEY_ID,
      secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      bucketName: c.env.R2_BUCKET_NAME,
    };

    const storage = new R2StorageProvider(r2Config);
    try {
      await storage.delete(record.objectKey);
    } catch {
      console.error(`Failed to delete file ${fileId} from R2 — orphan cleanup will handle`);
    }

    // Delete from DB
    await db.delete(resource).where(eq(resource.id, fileId));

    return c.json({
      success: true,
      data: { message: "File deleted successfully" },
    });
  } catch (error: any) {
    console.error("File delete error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete file",
        },
      },
      500
    );
  }
});

// ============================================================================
// Helpers (continued)
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

export default fileRoutes;
