import { describe, it, expect, vi, beforeEach } from "vitest";
import authRoutes from "./auth";
import { Hono } from "hono";

// Mock Better Auth
vi.mock("../../infra/auth", () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
      signInEmail: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
    },
  },
}));

import { auth } from "../../infra/auth";

const app = new Hono();
app.route("/api/auth", authRoutes);

describe("Auth Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should create user and return session", async () => {
      const mockResult = {
        user: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          role: "student",
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: "token-123",
      };

      vi.mocked(auth.api.signUpEmail).mockResolvedValue({
        ...mockResult,
        redirect: false,
      } as any);

      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe("test@example.com");
      expect(data.data.session.token).toBe("token-123");
    });

    it("should return error for duplicate email", async () => {
      vi.mocked(auth.api.signUpEmail).mockRejectedValue(
        new Error("User with this email already exists")
      );

      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "existing@example.com",
          password: "password123",
          name: "Test User",
        }),
      });

      expect(response.status).toBe(409);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ALREADY_EXISTS");
    });

    it("should return error for invalid input", async () => {
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "invalid-email",
          password: "123",
          name: "",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should create user as student even when role: admin is sent", async () => {
      const mockResult = {
        user: {
          id: "user-456",
          name: "Hacker User",
          email: "hacker@example.com",
          role: "student",
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: "token-456",
      };

      vi.mocked(auth.api.signUpEmail).mockResolvedValue({
        ...mockResult,
        redirect: false,
      } as any);

      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "hacker@example.com",
          password: "password123",
          name: "Hacker User",
          role: "admin",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
      expect(data.data.user.role).toBe("student");

      // Verify signUpEmail was called WITHOUT the role field
      const callArgs = vi.mocked(auth.api.signUpEmail).mock.calls[0]?.[0];
      expect(callArgs).toBeDefined();
      expect(callArgs!.body).not.toHaveProperty("role");
    });

    it("should create user as student even when role: instructor is sent", async () => {
      const mockResult = {
        user: {
          id: "user-789",
          name: "Sneaky User",
          email: "sneaky@example.com",
          role: "student",
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: "token-789",
      };

      vi.mocked(auth.api.signUpEmail).mockResolvedValue({
        ...mockResult,
        redirect: false,
      } as any);

      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "sneaky@example.com",
          password: "password123",
          name: "Sneaky User",
          role: "instructor",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
      expect(data.data.user.role).toBe("student");

      // Verify signUpEmail was called WITHOUT the role field
      const callArgs = vi.mocked(auth.api.signUpEmail).mock.calls[0]?.[0];
      expect(callArgs).toBeDefined();
      expect(callArgs!.body).not.toHaveProperty("role");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return session for valid credentials", async () => {
      const mockResult = {
        user: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          role: "student",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: "token-123",
      };

      vi.mocked(auth.api.signInEmail).mockResolvedValue({
        ...mockResult,
        redirect: false,
      } as any);

      const response = await app.request("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe("test@example.com");
      expect(data.data.session.token).toBe("token-123");
    });

    it("should return error for invalid credentials", async () => {
      vi.mocked(auth.api.signInEmail).mockRejectedValue(
        new Error("Invalid email or password")
      );

      const response = await app.request("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      vi.mocked(auth.api.signOut).mockResolvedValue({ status: true } as any);

      const response = await app.request("/api/auth/logout", {
        method: "POST",
        headers: {
          Cookie: "session=token-123",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should send password reset email", async () => {
      vi.mocked(auth.api.requestPasswordReset).mockResolvedValue({
        status: true,
        message: "Password reset email sent",
      } as any);

      const response = await app.request("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
    });

    it("should return success even for non-existent email", async () => {
      vi.mocked(auth.api.requestPasswordReset).mockRejectedValue(
        new Error("User not found")
      );

      const response = await app.request("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "nonexistent@example.com",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should reset password successfully", async () => {
      vi.mocked(auth.api.resetPassword).mockResolvedValue({
        status: true,
      } as any);

      const response = await app.request("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "reset-token-123",
          password: "newpassword123",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
    });

    it("should return error for invalid token", async () => {
      vi.mocked(auth.api.resetPassword).mockRejectedValue(
        new Error("Invalid token")
      );

      const response = await app.request("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "invalid-token",
          password: "newpassword123",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_TOKEN");
    });
  });

  describe("GET /api/auth/verify-email", () => {
    it("should verify email successfully", async () => {
      vi.mocked(auth.api.verifyEmail).mockResolvedValue({
        status: true,
      } as any);

      const response = await app.request(
        "/api/auth/verify-email?token=verify-token-123"
      );

      expect(response.status).toBe(200);
      const data = await response.json() as any;
      expect(data.success).toBe(true);
    });

    it("should return error for missing token", async () => {
      const response = await app.request("/api/auth/verify-email");

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return error for invalid token", async () => {
      vi.mocked(auth.api.verifyEmail).mockRejectedValue(
        new Error("Invalid token")
      );

      const response = await app.request(
        "/api/auth/verify-email?token=invalid-token"
      );

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_TOKEN");
    });
  });
});