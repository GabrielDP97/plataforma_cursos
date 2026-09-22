ALTER TABLE "user" ADD COLUMN "username" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "must_change_password" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE ("username");