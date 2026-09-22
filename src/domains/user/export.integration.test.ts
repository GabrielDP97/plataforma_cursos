import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { exportUserData, ExportError } from "./export";
import { db } from "../../infra/db";
import { user } from "../../infra/schema/user";
import { enrollment } from "../../infra/schema/enrollment";
import { notification } from "../../infra/schema/notification";
import { userConsent } from "../../infra/schema/consent";
import { eq } from "drizzle-orm";

const TEST_USER_ID = "test-gdpr-export-001";
const TEST_USER_EMAIL = "gdpr-export@example.com";
const TEST_COURSE_ID = "test-course-export-001";

describe("GDPR Data Export (M15)", () => {
  beforeAll(async () => {
    // Create test user
    await db.insert(user).values({
      id: TEST_USER_ID,
      name: "GDPR Export User",
      email: TEST_USER_EMAIL,
      emailVerified: false,
      role: "student",
    });

    // Create test enrollment
    await db.insert(enrollment).values({
      id: "test-enrollment-export-001",
      userId: TEST_USER_ID,
      courseId: TEST_COURSE_ID,
      status: "active",
      source: "free",
    });

    // Create test notification
    await db.insert(notification).values({
      userId: TEST_USER_ID,
      type: "enrollment",
      title: "Welcome",
      message: "You have been enrolled",
    });

    // Create test consent
    await db.insert(userConsent).values({
      userId: TEST_USER_ID,
      termsVersion: "1.0",
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(notification).where(eq(notification.userId, TEST_USER_ID));
    await db
      .delete(userConsent)
      .where(eq(userConsent.userId, TEST_USER_ID));
    await db
      .delete(enrollment)
      .where(eq(enrollment.userId, TEST_USER_ID));
    await db.delete(user).where(eq(user.id, TEST_USER_ID));
  });

  describe("exportUserData", () => {
    it("should return a versioned export document", async () => {
      const doc = await exportUserData(TEST_USER_ID);

      expect(doc).toBeDefined();
      expect(doc.exportVersion).toBe("1.0");
      expect(doc.generatedAt).toBeDefined();
      expect(doc.user).toBeDefined();
      expect(doc.enrollments).toBeDefined();
      expect(doc.progress).toBeDefined();
      expect(doc.notifications).toBeDefined();
      expect(doc.consentHistory).toBeDefined();
    });

    it("should include correct user data", async () => {
      const doc = await exportUserData(TEST_USER_ID);

      expect(doc.user.id).toBe(TEST_USER_ID);
      expect(doc.user.email).toBe(TEST_USER_EMAIL);
      expect(doc.user.name).toBe("GDPR Export User");
      expect(doc.user.role).toBe("student");
      expect(doc.user.createdAt).toBeDefined();
    });

    it("should include enrollments", async () => {
      const doc = await exportUserData(TEST_USER_ID);

      expect(doc.enrollments.length).toBeGreaterThanOrEqual(1);
      const enrollment = doc.enrollments.find(
        (e) => e.courseId === TEST_COURSE_ID
      );
      expect(enrollment).toBeDefined();
      expect(enrollment!.status).toBe("active");
      expect(enrollment!.source).toBe("free");
    });

    it("should include notifications", async () => {
      const doc = await exportUserData(TEST_USER_ID);

      expect(doc.notifications.length).toBeGreaterThanOrEqual(1);
      expect(doc.notifications[0].title).toBe("Welcome");
      expect(doc.notifications[0].read).toBe(false);
    });

    it("should include consent history", async () => {
      const doc = await exportUserData(TEST_USER_ID);

      expect(doc.consentHistory.length).toBeGreaterThanOrEqual(1);
      expect(doc.consentHistory[0].termsVersion).toBe("1.0");
      expect(doc.consentHistory[0].acceptedAt).toBeDefined();
    });

    it("should exclude sensitive fields (no passwords, tokens, sessions)", async () => {
      const doc = await exportUserData(TEST_USER_ID);

      // User object should NOT contain password or token fields
      expect(doc.user).not.toHaveProperty("password");
      expect(doc.user).not.toHaveProperty("token");
      expect(doc.user).not.toHaveProperty("session");
    });

    it("should throw USER_NOT_FOUND for nonexistent user", async () => {
      await expect(
        exportUserData("nonexistent-user-id")
      ).rejects.toThrow(ExportError);
    });

    it("exported dates should be ISO strings", async () => {
      const doc = await exportUserData(TEST_USER_ID);

      expect(typeof doc.user.createdAt).toBe("string");
      expect(new Date(doc.user.createdAt).toISOString()).toBe(
        doc.user.createdAt
      );

      if (doc.enrollments.length > 0) {
        expect(typeof doc.enrollments[0].enrolledAt).toBe("string");
      }
    });
  });
});
