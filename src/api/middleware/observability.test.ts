import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { requestId } from "./request-id";
import { logger } from "./logger";
import { errorHandler } from "./error-handler";
import { AppError, ErrorCode } from "../../shared/errors";

// Define env type for Hono context
type TestEnv = {
  Variables: {
    requestId: string;
    user: { id: string; role?: string };
    errorCode: string;
  };
};

describe("M16 — Observability & Error Contract", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("Request ID Middleware", () => {
    it("generates a UUID when no X-Request-Id header is present", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");
      const headerId = res.headers.get("X-Request-Id");

      expect(headerId).toBeTruthy();
      expect(headerId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it("preserves the client-provided X-Request-Id", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.get("/test", (c) => c.json({ ok: true }));

      const customId = "my-custom-request-id-123";
      const res = await app.request("/test", {
        headers: { "X-Request-Id": customId },
      });

      expect(res.headers.get("X-Request-Id")).toBe(customId);
    });

    it("sets requestId in context", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.get("/test", (c) => {
        return c.json({ requestId: c.get("requestId") });
      });

      const res = await app.request("/test");
      const body = await res.json() as Record<string, unknown>;

      expect(body.requestId).toBeTruthy();
      expect(typeof body.requestId).toBe("string");
    });
  });

  describe("Structured Logger Middleware", () => {
    it("logs request start and completion", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.use("*", logger);
      app.get("/test", (c) => c.json({ ok: true }));

      await app.request("/test");

      // Should have at least 2 log entries (start + end)
      expect(consoleSpy.mock.calls.length).toBeGreaterThanOrEqual(2);

      // Parse the log entries
      const logEntries = consoleSpy.mock.calls.map((call) =>
        JSON.parse(call[0] as string)
      );

      // Find the request start log
      const startLog = logEntries.find(
        (log: any) => log.message === "Request started"
      );
      expect(startLog).toBeTruthy();
      expect(startLog.requestId).toBeTruthy();
      expect(startLog.method).toBe("GET");
      expect(startLog.route).toBe("/test");

      // Find the request end log
      const endLog = logEntries.find(
        (log: any) => log.message === "Request completed"
      );
      expect(endLog).toBeTruthy();
      expect(endLog.status).toBe(200);
      expect(endLog.duration).toBeGreaterThanOrEqual(0);
    });

    it("includes requestId in all log entries", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.use("*", logger);
      app.get("/test", (c) => c.json({ ok: true }));

      await app.request("/test");

      const logEntries = consoleSpy.mock.calls.map((call) =>
        JSON.parse(call[0] as string)
      );

      for (const entry of logEntries) {
        expect(entry.requestId).toBeTruthy();
      }
    });

    it("logs errors at error level for 5xx status", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.use("*", logger);
      app.onError(errorHandler);
      app.get("/test", () => {
        throw new Error("Internal failure");
      });

      await app.request("/test");

      const logEntries = consoleSpy.mock.calls.map((call) =>
        JSON.parse(call[0] as string)
      );

      const errorLog = logEntries.find(
        (log: any) => log.level === "error" && log.message === "Unhandled error"
      );
      expect(errorLog).toBeTruthy();
      expect(errorLog.requestId).toBeTruthy();
    });
  });

  describe("Error Handler", () => {
    it("returns consistent error format for AppError", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.use("*", logger);
      app.onError(errorHandler);
      app.get("/test", () => {
        throw new AppError(ErrorCode.COURSE_NOT_FOUND);
      });

      const res = await app.request("/test");
      const body = await res.json() as Record<string, unknown>;
      const error = body.error as Record<string, string>;

      expect(res.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("COURSE_NOT_FOUND");
      expect(error.message).toBe("Course not found");
      expect(error.requestId).toBeTruthy();
    });

    it("returns 500 for unexpected errors with generic message", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.use("*", logger);
      app.onError(errorHandler);
      app.get("/test", () => {
        throw new Error("Database connection failed");
      });

      const res = await app.request("/test");
      const body = await res.json() as Record<string, unknown>;
      const error = body.error as Record<string, string>;

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(error.code).toBe("INTERNAL_ERROR");
      expect(error.message).toBe("An unexpected error occurred");
      expect(error.requestId).toBeTruthy();
    });

    it("does not expose stack traces to client", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.use("*", logger);
      app.onError(errorHandler);
      app.get("/test", () => {
        throw new Error("Sensitive internal error");
      });

      const res = await app.request("/test");
      const body = await res.json() as Record<string, unknown>;

      expect(body.stack).toBeUndefined();
      expect(JSON.stringify(body)).not.toContain("Sensitive internal error");
    });

    it("includes requestId in error response", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.use("*", logger);
      app.onError(errorHandler);
      app.get("/test", () => {
        throw new AppError(ErrorCode.UNAUTHORIZED);
      });

      const res = await app.request("/test");
      const body = await res.json() as Record<string, unknown>;
      const error = body.error as Record<string, string>;
      const headerId = res.headers.get("X-Request-Id");

      expect(error.requestId).toBe(headerId);
    });

    it("returns validation details when present on AppError", async () => {
      const app = new Hono<TestEnv>();
      app.use("*", requestId);
      app.use("*", logger);
      app.onError(errorHandler);
      app.get("/test", () => {
        throw new AppError(ErrorCode.VALIDATION_ERROR, "Validation failed", {
          title: ["Title is required"],
          email: ["Invalid email format"],
        });
      });

      const res = await app.request("/test");
      const body = await res.json() as Record<string, unknown>;
      const error = body.error as Record<string, unknown>;

      expect(res.status).toBe(400);
      expect(error.details).toEqual({
        title: ["Title is required"],
        email: ["Invalid email format"],
      });
    });
  });
});
