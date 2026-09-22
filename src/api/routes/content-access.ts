import { Hono } from "hono";
import { db } from "../../infra/db";
import { module as moduleTable, lesson as lessonTable, contentBlock } from "../../infra/schema/content";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { isEnrolled } from "../../domains/enrollment/service";
import { ApiResponse } from "../../shared/types";

type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
};

const contentAccessRoutes = new Hono<Env>();

// ============================================================================
// Course Content Tree — GET /api/student/courses/:courseId/content
// Returns full course content tree (modules, lessons, blocks)
// Requires enrollment
// ============================================================================
contentAccessRoutes.get(
  "/student/courses/:courseId/content",
  requireAuth,
  async (c) => {
    try {
      const currentUser = c.get("user") as { id: string };
      const courseId = c.req.param("courseId")!;

      // Check enrollment
      const enrolled = await isEnrolled(currentUser.id, courseId);
      if (!enrolled) {
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

      // Get modules ordered by position
      const modules = await db
        .select()
        .from(moduleTable)
        .where(eq(moduleTable.courseId, courseId))
        .orderBy(asc(moduleTable.position));

      // Get lessons for each module, ordered by position
      const modulesWithContent = await Promise.all(
        modules.map(async (moduleRecord) => {
          const lessons = await db
            .select()
            .from(lessonTable)
            .where(eq(lessonTable.moduleId, moduleRecord.id))
            .orderBy(asc(lessonTable.position));

          // Get content blocks for each lesson
          const lessonsWithBlocks = await Promise.all(
            lessons.map(async (lessonRecord) => {
              const blocks = await db
                .select()
                .from(contentBlock)
                .where(eq(contentBlock.lessonId, lessonRecord.id))
                .orderBy(asc(contentBlock.position));

              // Transform blocks for client consumption
              const transformedBlocks = blocks.map((block) => {
                const base = {
                  id: block.id,
                  type: block.type,
                  position: block.position,
                };

                switch (block.type) {
                  case "text":
                    return {
                      ...base,
                      type: "text" as const,
                      content: block.content, // markdown/rich text
                    };

                  case "code":
                    return {
                      ...base,
                      type: "code" as const,
                      content: block.content,
                      language: (block.metadata as any)?.language || "plaintext",
                    };

                  case "video":
                    return {
                      ...base,
                      type: "video" as const,
                      videoAssetId: block.content, // video asset ID
                      // Stream URL will be generated on client side via /api/video/:id/stream
                    };

                  case "file":
                    return {
                      ...base,
                      type: "file" as const,
                      filename: (block.metadata as any)?.filename || "file",
                      objectKey: block.content,
                      mimeType: (block.metadata as any)?.mimeType || "application/octet-stream",
                      // Download URL will be generated on client side via /api/files/:id/download
                    };

                  case "link":
                    return {
                      ...base,
                      type: "link" as const,
                      url: block.content,
                      label: (block.metadata as any)?.label || block.content,
                    };

                  default:
                    return {
                      ...base,
                      content: block.content,
                    };
                }
              });

              return {
                id: lessonRecord.id,
                title: lessonRecord.title,
                description: lessonRecord.description,
                position: lessonRecord.position,
                blocks: transformedBlocks,
              };
            })
          );

          return {
            id: moduleRecord.id,
            title: moduleRecord.title,
            description: moduleRecord.description,
            position: moduleRecord.position,
            lessons: lessonsWithBlocks,
          };
        })
      );

      const response: ApiResponse<typeof modulesWithContent> = {
        success: true,
        data: modulesWithContent,
      };

      return c.json(response);
    } catch (error: any) {
      console.error("Content access error:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to load course content",
          },
        },
        500
      );
    }
  }
);

export default contentAccessRoutes;
