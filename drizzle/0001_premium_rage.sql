CREATE TABLE "course_instructors" (
	"course_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_instructors_course_id_user_id_pk" PRIMARY KEY("course_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "course_instructors" ADD CONSTRAINT "course_instructors_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_instructors" ADD CONSTRAINT "course_instructors_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;