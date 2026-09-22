import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  UserError,
} from "./service";
import { db } from "../../infra/db";
import { user } from "../../infra/schema/user";
import { eq } from "drizzle-orm";

// Test data
const TEST_USER_ID = "test-user-profile-001";
const TEST_USER_ID_2 = "test-user-profile-002";
const TEST_USER_NAME = "Test User";
const TEST_USER_EMAIL = "test-profile@example.com";

describe("User Profile Service (M10)", () => {
  beforeAll(async () => {
    // Create test users
    await db.insert(user).values({
      id: TEST_USER_ID,
      name: TEST_USER_NAME,
      email: TEST_USER_EMAIL,
      emailVerified: false,
      role: "student",
    });

    await db.insert(user).values({
      id: TEST_USER_ID_2,
      name: "Other User",
      email: "other-profile@example.com",
      emailVerified: false,
      role: "student",
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(user).where(eq(user.id, TEST_USER_ID));
    await db.delete(user).where(eq(user.id, TEST_USER_ID_2));
  });

  describe("Get Profile", () => {
    it("should return user profile by ID", async () => {
      const profile = await getProfile(TEST_USER_ID);

      expect(profile).toBeDefined();
      expect(profile.id).toBe(TEST_USER_ID);
      expect(profile.name).toBe(TEST_USER_NAME);
      expect(profile.email).toBe(TEST_USER_EMAIL);
      expect(profile.role).toBe("student");
    });

    it("should throw USER_NOT_FOUND for nonexistent user", async () => {
      await expect(
        getProfile("nonexistent-user-id")
      ).rejects.toThrow(UserError);
    });
  });

  describe("Update Profile", () => {
    it("should update user name", async () => {
      const updated = await updateProfile(TEST_USER_ID, {
        name: "Updated Name",
      });

      expect(updated.name).toBe("Updated Name");
      expect(updated.id).toBe(TEST_USER_ID);

      // Verify in database
      const profile = await getProfile(TEST_USER_ID);
      expect(profile.name).toBe("Updated Name");

      // Reset for other tests
      await updateProfile(TEST_USER_ID, { name: TEST_USER_NAME });
    });

    it("should update user image", async () => {
      const imageUrl = "https://example.com/avatar.jpg";
      const updated = await updateProfile(TEST_USER_ID, {
        image: imageUrl,
      });

      expect(updated.image).toBe(imageUrl);

      // Reset
      await updateProfile(TEST_USER_ID, { image: null as any });
    });

    it("should update both name and image", async () => {
      const updated = await updateProfile(TEST_USER_ID, {
        name: "Both Updated",
        image: "https://example.com/new.jpg",
      });

      expect(updated.name).toBe("Both Updated");
      expect(updated.image).toBe("https://example.com/new.jpg");

      // Reset
      await updateProfile(TEST_USER_ID, {
        name: TEST_USER_NAME,
        image: null as any,
      });
    });

    it("should throw USER_NOT_FOUND for nonexistent user", async () => {
      await expect(
        updateProfile("nonexistent-user-id", { name: "Test" })
      ).rejects.toThrow(UserError);
    });
  });

  describe("Upload Avatar", () => {
    it("should reject invalid MIME type", async () => {
      const mockStorage = {
        upload: async () => ({ key: "test", size: 100, contentType: "text/plain" }),
        getSignedUrl: async () => "https://example.com/signed-url",
      };

      const invalidFile = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([0, 1, 2, 3]));
          controller.close();
        },
      });

      await expect(
        uploadAvatar(TEST_USER_ID, invalidFile, "text/plain", mockStorage)
      ).rejects.toThrow(UserError);
    });

    it("should throw USER_NOT_FOUND for nonexistent user", async () => {
      const mockStorage = {
        upload: async () => ({ key: "test", size: 100, contentType: "image/jpeg" }),
        getSignedUrl: async () => "https://example.com/signed-url",
      };

      const validFile = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([0, 1, 2, 3]));
          controller.close();
        },
      });

      await expect(
        uploadAvatar("nonexistent-user-id", validFile, "image/jpeg", mockStorage)
      ).rejects.toThrow(UserError);
    });
  });
});
