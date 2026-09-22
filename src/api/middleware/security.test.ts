import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import { securityHeaders } from "./security-headers";
import { corsMiddleware } from "./cors";
import { validate } from "./validate";
import { auditLog, AuditEvent } from "../../shared/audit";
import { z } from "zod";

describe("M17 — Security Hardening", () => {
  describe("Security Headers", () => {
    it("adds X-Content-Type-Options: nosniff", async () => {
      const app = new Hono();
      app.use("*", securityHeaders);
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");

      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });

    it("adds X-Frame-Options: DENY", async () => {
      const app = new Hono();
      app.use("*", securityHeaders);
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");

      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    });

    it("adds X-XSS-Protection", async () => {
      const app = new Hono();
      app.use("*", securityHeaders);
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");

      expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
    });

    it("adds Referrer-Policy", async () => {
      const app = new Hono();
      app.use("*", securityHeaders);
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");

      expect(res.headers.get("Referrer-Policy")).toBe(
        "strict-origin-when-cross-origin"
      );
    });

    it("adds Content-Security-Policy", async () => {
      const app = new Hono();
      app.use("*", securityHeaders);
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");

      expect(res.headers.get("Content-Security-Policy")).toBe("default-src 'self'");
    });

    it("adds Strict-Transport-Security", async () => {
      const app = new Hono();
      app.use("*", securityHeaders);
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");

      expect(res.headers.get("Strict-Transport-Security")).toBe(
        "max-age=31536000; includeSubDomains"
      );
    });
  });

  describe("CORS Middleware", () => {
    it("allows requests from allowed origins", async () => {
      const app = new Hono();
      app.use("*", corsMiddleware("development"));
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        headers: { Origin: "http://localhost:5173" },
      });

      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:5173"
      );
    });

    it("blocks requests from disallowed origins", async () => {
      const app = new Hono();
      app.use("*", corsMiddleware("development"));
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        headers: { Origin: "https://evil.com" },
      });

      expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });

    it("handles preflight OPTIONS requests", async () => {
      const app = new Hono();
      app.use("*", corsMiddleware("development"));
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "OPTIONS",
        headers: { Origin: "http://localhost:5173" },
      });

      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:5173"
      );
      expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    });

    it("rejects preflight from disallowed origins", async () => {
      const app = new Hono();
      app.use("*", corsMiddleware("development"));
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "OPTIONS",
        headers: { Origin: "https://evil.com" },
      });

      expect(res.status).toBe(403);
    });

    it("allows custom origins", async () => {
      const app = new Hono();
      app.use("*", corsMiddleware("development", ["https://custom.domain.com"]));
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        headers: { Origin: "https://custom.domain.com" },
      });

      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "https://custom.domain.com"
      );
    });
  });

  describe("Validation Middleware", () => {
    it("passes valid body through", async () => {
      const app = new Hono();
      const schema = z.object({ name: z.string().min(1) });
      app.post("/test", validate({ body: schema }), (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });

      expect(res.status).toBe(200);
    });

    it("rejects invalid body with field-level errors", async () => {
      const app = new Hono();
      const schema = z.object({ name: z.string().min(1), email: z.string().email() });
      app.post("/test", validate({ body: schema }), (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", email: "not-an-email" }),
      });

      const body = await res.json() as Record<string, unknown>;
      const error = body.error as Record<string, unknown>;
      const details = error.details as Record<string, string[]>;

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(details).toBeTruthy();
      expect(details.name).toBeTruthy();
      expect(details.name.length).toBeGreaterThan(0);
      expect(details.email).toBeTruthy();
      expect(details.email.length).toBeGreaterThan(0);
    });

    it("validates query parameters", async () => {
      const app = new Hono();
      const schema = z.object({ page: z.coerce.number().int().min(1) });
      app.get("/test", validate({ query: schema }), (c) => c.json({ ok: true }));

      const res = await app.request("/test?page=0");
      const body = await res.json() as Record<string, unknown>;
      const error = body.error as Record<string, string>;

      expect(res.status).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("validates path parameters", async () => {
      const app = new Hono();
      const schema = z.object({ id: z.string().uuid() });
      app.get("/test/:id", validate({ params: schema }), (c) => c.json({ ok: true }));

      const res = await app.request("/test/not-a-uuid");
      const body = await res.json() as Record<string, unknown>;
      const error = body.error as Record<string, string>;

      expect(res.status).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Audit Logging", () => {
    it("logs security events as structured JSON", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      auditLog({
        type: AuditEvent.LOGIN,
        userId: "user-123",
        action: "User logged in",
        requestId: "req-456",
        ipAddress: "192.168.1.1",
      });

      expect(consoleSpy).toHaveBeenCalledOnce();
      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string);

      expect(logEntry.type).toBe("LOGIN");
      expect(logEntry.userId).toBe("user-123");
      expect(logEntry.action).toBe("User logged in");
      expect(logEntry.requestId).toBe("req-456");
      expect(logEntry.ipAddress).toBe("192.168.1.1");
      expect(logEntry.timestamp).toBeTruthy();

      consoleSpy.mockRestore();
    });

    it("includes all required audit event types", () => {
      // Verify all audit events are defined
      expect(AuditEvent.LOGIN).toBe("LOGIN");
      expect(AuditEvent.LOGOUT).toBe("LOGOUT");
      expect(AuditEvent.REGISTER).toBe("REGISTER");
      expect(AuditEvent.LOGIN_FAILED).toBe("LOGIN_FAILED");
      expect(AuditEvent.PASSWORD_RESET).toBe("PASSWORD_RESET");
      expect(AuditEvent.ROLE_CHANGE).toBe("ROLE_CHANGE");
      expect(AuditEvent.COURSE_PUBLISH).toBe("COURSE_PUBLISH");
      expect(AuditEvent.DATA_EXPORT).toBe("DATA_EXPORT");
      expect(AuditEvent.DATA_DELETE).toBe("DATA_DELETE");
      expect(AuditEvent.FILE_UPLOAD).toBe("FILE_UPLOAD");
    });

    it("handles optional fields gracefully", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      auditLog({
        type: AuditEvent.LOGIN,
        action: "User logged in",
      });

      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string);

      expect(logEntry.userId).toBeUndefined();
      expect(logEntry.targetId).toBeUndefined();
      expect(logEntry.requestId).toBeUndefined();
      expect(logEntry.ipAddress).toBeUndefined();
      expect(logEntry.timestamp).toBeTruthy();

      consoleSpy.mockRestore();
    });
  });
});
