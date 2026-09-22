import { describe, it, expect, beforeEach } from "vitest";
import { EmailService } from "./service";
import type { EmailProvider, SendEmailParams } from "../providers/email-provider";

// ============================================================================
// Mock EmailProvider
// ============================================================================

function createMockProvider(): EmailProvider & {
  sent: SendEmailParams[];
  shouldFail: boolean;
} {
  const provider = {
    sent: [] as SendEmailParams[],
    shouldFail: false,
    async send(params: SendEmailParams): Promise<{ id?: string }> {
      if (provider.shouldFail) {
        throw new Error("Simulated email failure");
      }
      provider.sent.push(params);
      return { id: "test-email-id" };
    },
  };
  return provider;
}

// ============================================================================
// Tests
// ============================================================================

describe("EmailService", () => {
  let mockProvider: ReturnType<typeof createMockProvider>;
  let emailService: EmailService;

  beforeEach(() => {
    mockProvider = createMockProvider();
    emailService = new EmailService(mockProvider);
  });

  describe("sendWelcome", () => {
    it("should send welcome email via provider", async () => {
      await emailService.sendWelcome("test@example.com", "John Doe");

      expect(mockProvider.sent).toHaveLength(1);
      expect(mockProvider.sent[0].to).toBe("test@example.com");
      expect(mockProvider.sent[0].subject).toBe("Welcome to LMS Platform");
      expect(mockProvider.sent[0].html).toContain("John Doe");
      expect(mockProvider.sent[0].html).toContain("Welcome to LMS Platform");
    });

    it("should not throw when email fails", async () => {
      mockProvider.shouldFail = true;

      // Should not throw
      await expect(
        emailService.sendWelcome("test@example.com", "John Doe")
      ).resolves.toBeUndefined();

      // Should not have sent
      expect(mockProvider.sent).toHaveLength(0);
    });
  });

  describe("sendPasswordReset", () => {
    it("should send password reset email", async () => {
      await emailService.sendPasswordReset(
        "test@example.com",
        "https://example.com/reset?token=abc123"
      );

      expect(mockProvider.sent).toHaveLength(1);
      expect(mockProvider.sent[0].to).toBe("test@example.com");
      expect(mockProvider.sent[0].subject).toBe("Reset your password");
      expect(mockProvider.sent[0].html).toContain("Reset Password");
      expect(mockProvider.sent[0].html).toContain(
        "https://example.com/reset?token=abc123"
      );
    });

    it("should not throw when email fails", async () => {
      mockProvider.shouldFail = true;

      await expect(
        emailService.sendPasswordReset("test@example.com", "https://reset.url")
      ).resolves.toBeUndefined();
    });
  });

  describe("sendEnrollmentConfirmation", () => {
    it("should send enrollment confirmation email", async () => {
      await emailService.sendEnrollmentConfirmation(
        "test@example.com",
        "Introduction to TypeScript"
      );

      expect(mockProvider.sent).toHaveLength(1);
      expect(mockProvider.sent[0].to).toBe("test@example.com");
      expect(mockProvider.sent[0].subject).toBe(
        'Enrolled in "Introduction to TypeScript"'
      );
      expect(mockProvider.sent[0].html).toContain(
        "Introduction to TypeScript"
      );
    });

    it("should not throw when email fails", async () => {
      mockProvider.shouldFail = true;

      await expect(
        emailService.sendEnrollmentConfirmation(
          "test@example.com",
          "Course Name"
        )
      ).resolves.toBeUndefined();
    });
  });

  describe("sendAnnouncement", () => {
    it("should send announcement email", async () => {
      await emailService.sendAnnouncement(
        "test@example.com",
        "TypeScript Course",
        "New Lesson Available",
        "We just added a new lesson on generics."
      );

      expect(mockProvider.sent).toHaveLength(1);
      expect(mockProvider.sent[0].to).toBe("test@example.com");
      expect(mockProvider.sent[0].subject).toBe(
        "[TypeScript Course] New Lesson Available"
      );
      expect(mockProvider.sent[0].html).toContain("New Lesson Available");
      expect(mockProvider.sent[0].html).toContain(
        "We just added a new lesson on generics."
      );
    });

    it("should not throw when email fails", async () => {
      mockProvider.shouldFail = true;

      await expect(
        emailService.sendAnnouncement(
          "test@example.com",
          "Course",
          "Title",
          "Message"
        )
      ).resolves.toBeUndefined();
    });
  });

  describe("HTML escaping", () => {
    it("should escape HTML in user-provided content", async () => {
      await emailService.sendWelcome("test@example.com", '<script>alert("xss")</script>');

      expect(mockProvider.sent).toHaveLength(1);
      expect(mockProvider.sent[0].html).not.toContain("<script>");
      expect(mockProvider.sent[0].html).toContain("&lt;script&gt;");
    });
  });
});
