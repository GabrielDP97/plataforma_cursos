import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./user";

// UserConsent table — GDPR consent tracking
export const userConsent = pgTable("user_consent", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  termsVersion: varchar("terms_version", { length: 50 }).notNull(),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 255 }),
});
