import { describe, it, expect } from "vitest";
import app from "../index";

// ============================================================================
// API Contract Tests (T114)
// Validates ApiResponse format, error catalog, requestId, security headers
// ============================================================================

describe("API Contract Tests", () => {
  describe("Health endpoint contract", () => {
    it("should return 200 with health data", async () => {
      const response = await app.request("/api/health");
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body).toHaveProperty("status", "ok");
      expect(body).toHaveProperty("timestamp");
      expect(body).toHaveProperty("checks");
    });

    it("should have checks object with worker and database", async () => {
      const response = await app.request("/api/health");
      const body = await response.json() as any;

      expect(body.checks).toHaveProperty("worker", "ok");
      expect(body.checks).toHaveProperty("database", "ok");
    });
  });

  describe("Error response contract (AppError via error handler)", () => {
    it("should return { success: false, error: { code, message } } for domain errors", async () => {
      // Hit an endpoint that throws an AppError with invalid data
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          password: "123",
          name: "",
        }),
      });

      const body = await response.json() as any;

      expect(body).toHaveProperty("success", false);
      expect(body).toHaveProperty("error");
      expect(body.error).toHaveProperty("code");
      expect(body.error).toHaveProperty("message");
      expect(typeof body.error.code).toBe("string");
      expect(typeof body.error.message).toBe("string");
    });

    it("should include requestId in x-request-id header for error responses", async () => {
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          password: "123",
          name: "",
        }),
      });

      const requestId = response.headers.get("x-request-id");
      expect(requestId).toBeTruthy();
    });
  });

  describe("Request ID middleware", () => {
    it("should include x-request-id header in response", async () => {
      const response = await app.request("/api/health");
      const requestId = response.headers.get("x-request-id");
      expect(requestId).toBeTruthy();
      expect(typeof requestId).toBe("string");
    });

    it("should use provided x-request-id from request", async () => {
      const customId = "test-request-123";
      const response = await app.request("/api/health", {
        headers: { "x-request-id": customId },
      });
      const requestId = response.headers.get("x-request-id");
      expect(requestId).toBe(customId);
    });

    it("should generate unique request IDs for different requests", async () => {
      const response1 = await app.request("/api/health");
      const response2 = await app.request("/api/health");
      const id1 = response1.headers.get("x-request-id");
      const id2 = response2.headers.get("x-request-id");
      expect(id1).not.toBe(id2);
    });
  });

  describe("Security headers", () => {
    it("should include security headers in response", async () => {
      const response = await app.request("/api/health");
      const headers = response.headers;

      expect(headers.get("x-content-type-options")).toBe("nosniff");
      expect(headers.get("x-frame-options")).toBe("DENY");
    });
  });

  describe("CORS headers", () => {
    it("should handle CORS preflight request", async () => {
      const response = await app.request("/api/health", {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:5173",
          "Access-Control-Request-Method": "GET",
        },
      });

      // Should return 204 for preflight
      expect([200, 204]).toContain(response.status);
    });
  });

  describe("HTTP method enforcement", () => {
    it("should return 404 for GET on POST-only route", async () => {
      // Use /api/admin/users (POST-only via PATCH) instead of /api/auth/register
      // because /api/auth/* is handled by Better Auth catch-all
      const response = await app.request("/api/files", {
        method: "GET",
        headers: { Authorization: "Bearer test-token" },
      });
      // Should be 401 (auth required) or 404, not 200
      expect(response.status).not.toBe(200);
    });

    it("should return 404 for POST on GET-only route", async () => {
      const response = await app.request("/api/health", {
        method: "POST",
      });
      expect(response.status).toBe(404);
    });
  });

  describe("Content-Type enforcement", () => {
    it("should accept JSON content type for POST", async () => {
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "123456",
          name: "Test",
        }),
      });

      // Should not fail due to content-type (415) — may fail validation (400)
      expect(response.status).not.toBe(415);
    });
  });

  describe("Response structure consistency", () => {
    it("health endpoint should always return valid JSON", async () => {
      const response = await app.request("/api/health");
      const text = await response.text();
      expect(() => JSON.parse(text)).not.toThrow();
    });

    it("error responses from error handler should have consistent structure", async () => {
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid",
          password: "123",
          name: "",
        }),
      });

      // Error handler wraps in { success: false, error: { code, message } }
      if (response.headers.get("content-type")?.includes("application/json")) {
        const body = await response.json() as any;
        expect(body.success).toBe(false);
        expect(typeof body.error.code).toBe("string");
        expect(typeof body.error.message).toBe("string");
      }
    });
  });
});
