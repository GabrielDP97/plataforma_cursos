-- Better Auth schema alignment:
-- 1. Add createdAt/updatedAt to session table
-- 2. Rename verification.token → verification.value  
-- 3. Add updatedAt to verification table

-- Session: add missing columns
ALTER TABLE "session" ADD COLUMN "created_at" timestamp NOT NULL DEFAULT now();
ALTER TABLE "session" ADD COLUMN "updated_at" timestamp NOT NULL DEFAULT now();

-- Verification: rename token → value (copy data first)
ALTER TABLE "verification" ADD COLUMN "value" varchar(255);
UPDATE "verification" SET "value" = "token";
ALTER TABLE "verification" ALTER COLUMN "value" SET NOT NULL;
ALTER TABLE "verification" ADD CONSTRAINT "verification_value_unique" UNIQUE ("value");
ALTER TABLE "verification" DROP CONSTRAINT IF EXISTS "session_token_unique";
ALTER TABLE "verification" DROP COLUMN "token";

-- Verification: add updatedAt
ALTER TABLE "verification" ADD COLUMN "updated_at" timestamp NOT NULL DEFAULT now();
