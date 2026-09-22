import { db } from "../../infra/db";
import { userConsent } from "../../infra/schema/consent";
import { eq, desc } from "drizzle-orm";

// ============================================================================
// Consent Service (M15)
// ============================================================================

export const CURRENT_TERMS_VERSION = "1.0";

/**
 * Record a consent acceptance.
 */
export async function recordConsent(
  userId: string,
  termsVersion: string,
  ipAddress?: string
): Promise<void> {
  await db.insert(userConsent).values({
    userId,
    termsVersion,
    ipAddress,
  });
}

/**
 * Get the latest consent for a user.
 */
export async function getLatestConsent(userId: string) {
  const [latest] = await db
    .select()
    .from(userConsent)
    .where(eq(userConsent.userId, userId))
    .orderBy(desc(userConsent.acceptedAt))
    .limit(1);

  return latest;
}

/**
 * Check if user has accepted the current terms version.
 */
export async function hasAcceptedCurrentTerms(
  userId: string
): Promise<boolean> {
  const latest = await getLatestConsent(userId);
  return latest?.termsVersion === CURRENT_TERMS_VERSION;
}

/**
 * List all consent records for a user (consent history).
 */
export async function listConsentHistory(userId: string) {
  return db
    .select()
    .from(userConsent)
    .where(eq(userConsent.userId, userId))
    .orderBy(desc(userConsent.acceptedAt));
}

/**
 * Record consent on registration (if not already recorded).
 * Used during the registration flow.
 */
export async function ensureRegistrationConsent(
  userId: string,
  ipAddress?: string
): Promise<void> {
  const existing = await getLatestConsent(userId);
  if (!existing || existing.termsVersion !== CURRENT_TERMS_VERSION) {
    await recordConsent(userId, CURRENT_TERMS_VERSION, ipAddress);
  }
}
