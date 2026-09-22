import { Hono } from "hono";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  NotificationError,
} from "../../domains/notification/service";
import { ApiResponse } from "../../shared/types";

// Define the environment type for Hono context
type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
};

const notificationRoutes = new Hono<Env>();

// GET /api/notifications — list notifications with unread count
notificationRoutes.get("/", async (c) => {
  try {
    const user = c.get("user") as { id: string };

    if (!user?.id) {
      return c.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        401
      );
    }

    const query = c.req.query();
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const unreadOnly = query.unreadOnly === "true";

    const result = await listNotifications({
      userId: user.id,
      page,
      limit,
      unreadOnly,
    });

    const unreadCount = await getUnreadCount(user.id);

    const response: ApiResponse<typeof result.notifications> = {
      success: true,
      data: result.notifications,
      meta: result.meta,
    };

    // Return with unreadCount in the response
    return c.json({
      ...response,
      unreadCount,
    });
  } catch (error: any) {
    console.error("List notifications error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to list notifications",
        },
      },
      500
    );
  }
});

// GET /api/notifications/unread-count — get unread count
notificationRoutes.get("/unread-count", async (c) => {
  try {
    const user = c.get("user") as { id: string };

    if (!user?.id) {
      return c.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        401
      );
    }

    const unreadCount = await getUnreadCount(user.id);

    const response: ApiResponse<{ unreadCount: number }> = {
      success: true,
      data: { unreadCount },
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Get unread count error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get unread count",
        },
      },
      500
    );
  }
});

// PATCH /api/notifications/:notificationId/read — mark as read
notificationRoutes.patch("/:notificationId/read", async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const notificationId = c.req.param("notificationId")!;

    if (!user?.id) {
      return c.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        401
      );
    }

    await markNotificationRead(user.id, notificationId);

    return c.json({
      success: true,
      data: { message: "Notification marked as read" },
    });
  } catch (error: any) {
    if (error instanceof NotificationError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Mark notification read error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to mark notification as read",
        },
      },
      500
    );
  }
});

// POST /api/notifications/read-all — mark all as read
notificationRoutes.post("/read-all", async (c) => {
  try {
    const user = c.get("user") as { id: string };

    if (!user?.id) {
      return c.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        401
      );
    }

    await markAllNotificationsRead(user.id);

    return c.json({
      success: true,
      data: { message: "All notifications marked as read" },
    });
  } catch (error: any) {
    console.error("Mark all notifications read error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to mark all notifications as read",
        },
      },
      500
    );
  }
});

export default notificationRoutes;
