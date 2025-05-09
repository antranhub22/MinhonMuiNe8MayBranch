CREATE TABLE "call_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_id" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"room_number" text,
	"duration" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_id" text NOT NULL,
	"room_number" text NOT NULL,
	"order_type" text NOT NULL,
	"delivery_time" text NOT NULL,
	"special_instructions" text,
	"items" jsonb NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transcripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
