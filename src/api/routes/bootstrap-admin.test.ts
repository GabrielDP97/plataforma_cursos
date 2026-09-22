import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import bootstrapAdminRoutes from "./bootstrap-admin";
import { Hono } from "hono";

// Mock Better Auth
vi.mock("../../infra/auth", () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
    },
  },
}));

// Mock Drizzle DB — track call order to return different results for different queries
let selectCallCount = 0;

vi.mock("../../infra/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => {
          selectCallCount++;
          // First call: admin count check, second call: email existence check
          if (selectCallCount === 1) {
            return Promise.resolve([{ count: mockAdminCount() }]);
          }
          return Promise.resolve(mockExistingUser());
        }),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

// Mock consent
vi.mock("../../domains/user/consent", () => ({
  ensureRegistrationConsent: vi.fn(),
}));

import { auth } from "../../infra/auth";
import { db } from "../../infra/db";
import { ensureRegistrationConsent } from "../../domains/user/consent";

const mockAdminCount = vi.fn().mockReturnValue(0);
const mockExistingUser = vi.fn().mockReturnValue([]);

const app = new Hono();
app.route("/api/internal/bootstrap-admin", bootstrapAdminRoutes);

describe("Bootstrap Admin Routes", () => {
  const originalEnv = process.env.ADMIN_BOOTSTRAP_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    selectCallCount = 0;
    process.env.ADMIN_BOOTSTRAP_SECRET = "test-secret-12345678901234567890";
    mockAdminCount.mockReturnValue(0);
    mockExistingUser.mockReturnValue([]);
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ADMIN_BOOTSTRAP_SECRET;
    } else {
      process.env.ADMIN_BOOTSTRAP_SECRET = originalEnv;
    }
  });

  describe("POST /api/internal/bootstrap-admin", () => {
    it("should create admin when no admin exists and correct secret", async () => {
      mockAdminCount.mockReturnValue(0);
      mockExistingUser.mockReturnValue([]);

      vi.mocked(auth.api.signUpEmail).mockResolvedValue({
        user: { id: "user-new-1" },
        token: "token-new-1",
        redirect: false,
      } as any);

      const response = await app.request("/api/internal/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin User",
          email: "admin@example.com",
          password: "password123",
          secret: "test-secret-12345678901234567890",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
      expect(data.data.message).toBe("Admin account created successfully");
    });

    it("should reject when wrong secret is provided", async () => {
      mockAdminCount.mockReturnValue(0);

      const response = await app.request("/api/internal/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin User",
          email: "admin@example.com",
          password: "password123",
          secret: "wrong-secret",
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_SECRET");
    });

    it("should reject when admin already exists even with correct secret", async () => {
      mockAdminCount.mockReturnValue(1);

      const response = await app.request("/api/internal/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin User",
          email: "admin@example.com",
          password: "password123",
          secret: "test-secret-12345678901234567890",
        }),
      });

      expect(response.status).toBe(404);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("BOOTSTRAP_UNAVAILABLE");
    });

    it("should reject when admin already exists with wrong secret (secret checked first)", async () => {
      mockAdminCount.mockReturnValue(1);

      const response = await app.request("/api/internal/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin User",
          email: "admin@example.com",
          password: "password123",
          secret: "wrong-secret",
        }),
      });

      // Secret check happens before admin count check
      expect(response.status).toBe(403);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_SECRET");
    });

    it("should return 404 when ADMIN_BOOTSTRAP_SECRET env is not set", async () => {
      delete process.env.ADMIN_BOOTSTRAP_SECRET;

      const response = await app.request("/api/internal/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin User",
          email: "admin@example.com",
          password: "password123",
          secret: "any-secret",
        }),
      });

      expect(response.status).toBe(404);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("BOOTSTRAP_UNAVAILABLE");
    });

    it("should return validation error for invalid email", async () => {
      const response = await app.request("/api/internal/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin User",
          email: "not-an-email",
          password: "password123",
          secret: "test-secret-12345678901234567890",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return validation error for short password", async () => {
      const response = await app.request("/api/internal/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin User",
          email: "admin@example.com",
          password: "short",
          secret: "test-secret-12345678901234567890",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return validation error for missing required fields", async () => {
      const response = await app.request("/api/internal/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: "",
          password: "",
          secret: "",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject duplicate email", async () => {
      mockAdminCount.mockReturnValue(0);
      mockExistingUser.mockReturnValue([{ id: "existing-user" }]);

      const response = await app.request("/api/internal/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin User",
          email: "taken@example.com",
          password: "password123",
          secret: "test-secret-12345678901234567890",
        }),
      });

      expect(response.status).toBe(409);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ALREADY_EXISTS");
    });
  });

  describe("GET /api/internal/bootstrap-admin/status", () => {
    it("should return available: true when no admin exists", async () => {
      mockAdminCount.mockReturnValue(0);

      const response = await app.request("/api/internal/bootstrap-admin/status");

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
      expect(data.data.available).toBe(true);
    });

    it("should return available: false when admin exists", async () => {
      mockAdminCount.mockReturnValue(1);

      const response = await app.request("/api/internal/bootstrap-admin/status");

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
      expect(data.data.available).toBe(false);
    });
  });
});
