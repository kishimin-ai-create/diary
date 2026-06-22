CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE TABLE "diaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diaries" ADD CONSTRAINT "diaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX "diaries_user_id_idx" ON "diaries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "diaries_created_at_idx" ON "diaries" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_single_admin_uidx" ON "users" USING btree ("is_admin") WHERE "users"."is_admin" = true;
