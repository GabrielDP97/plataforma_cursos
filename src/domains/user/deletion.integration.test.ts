import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  requestDeletion,
  cancelDeletion,
  hardDeleteUser,
  isUserDeleted,
  DeletionError,
} from "./deletion";
import { db } from "../../infra/db";
import { user } from "../../infra/schema/user";
import { enrollment } from "../../infra/schema/enrollment";
import { notification } from "../../infra/schema/notification";
import { userConsent } from "../../infra/schema/consent";
import { eq } from "drizzle-orm";

const TEST_USER_ID = "test-gdpr-deletion-001";
const TEST_COURSE_ID = "test-course-deletion-001";

describe("Account Deletion Flow (M15)", () => {
  beforeAll(async () => {
    await db.insert(user).values({
      id: TEST_USER_ID,
      name: "Deletion Test User",
      email: "deletion@example.com",
      emailVerified: false,
      role: "student",
    });

    await db.insert(enrollment).values({
      id: "test-enrollment-deletion-001",
      userId: TEST_USER_ID,
      courseId: TEST_COURSE_ID,
      status: "active",
      source: "free",
    });

    await db.insert(notification).values({
      userId: TEST_USER_ID,
      type: "system",
      title: "Test Notification",
      message: "Test message",
    });

    await db.insert(userConsent).values({
      userId: TEST_USER_ID,
      termsVersion: "1.0",
    });
  });

  afterAll(async () => {
    // Cleanup (in case hard delete wasn't called)
    await db.delete(notification).where(eq(notification.userId, TEST_USER_ID));
    await db
      .delete(userConsent)
      .where(eq(userConsent.userId, TEST_USER_ID));
    await db
      .delete(enrollment)
      .where(eq(enrollment.userId, TEST_USER_ID));
    await db.delete(user).where(eq(user.id, TEST_USER_ID));
  });

  describe("Soft Delete (requestDeletion)", () => {
    it("should set deletedAt on the user", async () => {
      const result = await requestDeletion(TEST_USER_ID);

      expect(result.userId).toBe(TEST_USER_ID);
      expect(result.requestedAt).toBeDefined();
      expect(result.scheduledFor).toBeDefined();

      // Verify deletedAt is set
      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, TEST_USER_ID))
        .limit(1);

      expect(userData.deletedAt).not.toBeNull();
    });

    it("should throw ALREADY_DELETED if already deleted", async () => {
      await expect(requestDeletion(TEST_USER_ID)).rejects.toThrow(
        DeletionError
      );
      await expect(requestDeletion(TEST_USER_ID)).rejects.toThrow(
        "Account deletion already requested"
      );
    });

    it("should throw USER_NOT_FOUND for nonexistent user", async () => {
      await expect(
        requestDeletion("nonexistent-user-id")
      ).rejects.toThrow(DeletionError);
    });
  });

  describe("Cancel Deletion", () => {
    it("should remove deletedAt", async () => {
      await cancelDeletion(TEST_USER_ID);

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, TEST_USER_ID))
        .limit(1);

      expect(userData.deletedAt).toBeNull();
    });

    it("should throw NO_DELETION_PENDING if not deleted", async () => {
      await expect(cancelDeletion(TEST_USER_ID)).rejects.toThrow(
        DeletionError
      );
      await expect(cancelDeletion(TEST_USER_ID)).rejects.toThrow(
        "No pending deletion"
      );
    });
  });

  describe("Hard Delete", () => {
    it("should cascade delete all user data", async () => {
      // Re-request deletion first
      await requestDeletion(TEST_USER_ID);

      // Verify data exists before deletion
      const enrollmentsBefore = await db
        .select()
        .from(enrollment)
        .where(eq(enrollment.userId, TEST_USER_ID));
      expect(enrollmentsBefore.length).toBe(1);

      const notificationsBefore = await db
        .select()
        .from(notification)
        .where(eq(notification.userId, TEST_USER_ID));
      expect(notificationsBefore.length).toBe(1);

      // Hard delete
      await hardDeleteUser(TEST_USER_ID);

      // Verify user is gone
      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, TEST_USER_ID))
        .limit(1);
      expect(userData).toBeUndefined();

      // Verify cascade: enrollments deleted
      const enrollmentsAfter = await db
        .select()
        .from(enrollment)
        .where(eq(enrollment.userId, TEST_USER_ID));
      expect(enrollmentsAfter.length).toBe(0);

      // Verify cascade: notifications deleted
      const notificationsAfter = await db
        .select()
        .from(notification)
        .where(eq(notification.userId, TEST_USER_ID));
      expect(notificationsAfter.length).toBe(0);

      // Verify cascade: consents deleted
      const consentsAfter = await db
        .select()
        .from(userConsent)
        .where(eq(userConsent.userId, TEST_USER_ID));
      expect(consentsAfter.length).toBe(0);
    });

    it("should throw USER_NOT_FOUND for nonexistent user", async () => {
      await expect(
        hardDeleteUser("nonexistent-user-id")
      ).rejects.toThrow(DeletionError);
    });
  });

  describe("isUserDeleted", () => {
    it("should return false for non-deleted user", async () => {
      // Create a fresh user for this test
      const freshUserId = "test-gdpr-deletion-fresh";
      await db.insert(user).values({
        id: freshUserId,
        name: "Fresh User",
        email: "fresh-deletion@example.com",
        role: "student",
      });

      const deleted = await isUserDeleted(freshUserId);
      expect(deleted).toBe(false);

      // Cleanup
      await db.delete(user).where(eq(user.id, freshUserId));
    });
  });
});
