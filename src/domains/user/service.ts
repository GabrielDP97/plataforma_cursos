import { db } from "../../infra/db";
import { user } from "../../infra/schema/user";
import { eq } from "drizzle-orm";

// ============================================================================
// User Profile Service (M10)
// ============================================================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileInput {
  name?: string;
  image?: string;
}

/**
 * Get a user's profile by ID.
 */
export async function getProfile(userId: string): Promise<UserProfile> {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!result[0]) {
    throw new UserError("USER_NOT_FOUND", "User not found", 404);
  }

  return result[0];
}

/**
 * Update a user's own profile (name, image only).
 * Users can only edit their own profile.
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<UserProfile> {
  // Verify user exists
  const existing = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!existing[0]) {
    throw new UserError("USER_NOT_FOUND", "User not found", 404);
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.image !== undefined) updateData.image = data.image;

  const [updated] = await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, userId))
    .returning();

  return updated;
}

/**
 * Upload an avatar image to R2 and update the user's profile.
 * @returns The avatar URL (signed URL for R2)
 */
export async function uploadAvatar(
  userId: string,
  file: ReadableStream<Uint8Array>,
  contentType: string,
  storageProvider: {
    upload: (
      key: string,
      file: ReadableStream<Uint8Array>,
      contentType: string
    ) => Promise<{ key: string; size: number; contentType: string }>;
    getSignedUrl: (key: string, expiresIn?: number) => Promise<string>;
  }
): Promise<string> {
  // Verify user exists
  const existing = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!existing[0]) {
    throw new UserError("USER_NOT_FOUND", "User not found", 404);
  }

  // Validate MIME type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(contentType)) {
    throw new UserError(
      "INVALID_MIME_TYPE",
      "Avatar must be JPEG, PNG, GIF, or WebP",
      415
    );
  }

  // Generate server-side key (UUID-based, never user filenames)
  const key = `avatars/${userId}/${crypto.randomUUID()}`;

  // Upload to R2
  await storageProvider.upload(key, file, contentType);

  // Generate signed URL for the avatar
  const avatarUrl = await storageProvider.getSignedUrl(key);

  // Update user profile with new avatar URL
  await db
    .update(user)
    .set({ image: avatarUrl, updatedAt: new Date() })
    .where(eq(user.id, userId));

  return avatarUrl;
}

// ============================================================================
// Custom error class
// ============================================================================

export class UserError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "UserError";
  }
}
