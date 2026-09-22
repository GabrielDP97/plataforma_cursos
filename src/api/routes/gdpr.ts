import { Hono } from "hono";
import { z } from "zod";
import { exportUserData, ExportError } from "../../domains/user/export";
import {
  requestDeletion,
  cancelDeletion,
  DeletionError,
} from "../../domains/user/deletion";
import {
  listConsentHistory,
  CURRENT_TERMS_VERSION,
} from "../../domains/user/consent";
import { requireAuth } from "../middleware/auth";

type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
};

const gdprRoutes = new Hono<Env>();

// ============================================================================
// GET /me/export — GDPR data export
// ============================================================================

gdprRoutes.get("/me/export", requireAuth, async (c) => {
  try {
    const currentUser = c.get("user") as { id: string };
    const doc = await exportUserData(currentUser.id);

    return c.json(doc, 200, {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="user-data-export-${currentUser.id}.json"`,
    });
  } catch (error: any) {
    if (error instanceof ExportError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Export error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to export data" },
      },
      500
    );
  }
});

// ============================================================================
// POST /me/delete — Request account deletion (soft delete)
// ============================================================================

const deletionRequestSchema = z.object({});

gdprRoutes.post("/me/delete", requireAuth, async (c) => {
  try {
    const currentUser = c.get("user") as { id: string };
    deletionRequestSchema.parse(await c.req.json());

    const result = await requestDeletion(currentUser.id);

    return c.json({
      success: true,
      data: {
        message: "Account deletion requested. Your account will be permanently deleted in 30 days.",
        scheduledFor: result.scheduledFor.toISOString(),
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid request body" },
        },
        400
      );
    }

    if (error instanceof DeletionError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Deletion request error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to request deletion" },
      },
      500
    );
  }
});

// ============================================================================
// POST /me/delete/cancel — Cancel account deletion
// ============================================================================

gdprRoutes.post("/me/delete/cancel", requireAuth, async (c) => {
  try {
    const currentUser = c.get("user") as { id: string };
    await cancelDeletion(currentUser.id);

    return c.json({
      success: true,
      data: { message: "Account deletion cancelled. Your account is restored." },
    });
  } catch (error: any) {
    if (error instanceof DeletionError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Deletion cancel error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to cancel deletion" },
      },
      500
    );
  }
});

// ============================================================================
// GET /me/consent — List consent history
// ============================================================================

gdprRoutes.get("/me/consent", requireAuth, async (c) => {
  try {
    const currentUser = c.get("user") as { id: string };
    const history = await listConsentHistory(currentUser.id);

    return c.json({
      success: true,
      data: {
        currentVersion: CURRENT_TERMS_VERSION,
        history: history.map((record) => ({
          id: record.id,
          termsVersion: record.termsVersion,
          acceptedAt: record.acceptedAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error("Consent history error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to get consent history" },
      },
      500
    );
  }
});

export default gdprRoutes;
