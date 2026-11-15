CREATE TABLE "akoma_blocks" (
	"from_id" uuid,
	"to_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "akoma_blocks_pkey" PRIMARY KEY("from_id","to_id")
);
--> statement-breakpoint
CREATE TABLE "akoma_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"first_id" uuid NOT NULL,
	"second_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "akoma_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"match_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text NOT NULL,
	"client_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "akoma_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"payer_name" text NOT NULL,
	"phone" text NOT NULL,
	"transaction_id" text NOT NULL UNIQUE,
	"amount" integer NOT NULL,
	"days" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "akoma_profiles" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"birth_date" date NOT NULL,
	"gender" text NOT NULL,
	"looking_for" text[] NOT NULL,
	"city" text NOT NULL,
	"bio" text NOT NULL,
	"occupation" text DEFAULT '' NOT NULL,
	"intention" text NOT NULL,
	"interests" text[] NOT NULL,
	"photo_key" text NOT NULL,
	"paused" boolean DEFAULT false NOT NULL,
	"suspended" boolean DEFAULT false NOT NULL,
	"membership_until" timestamp with time zone,
	"consent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "akoma_rate_limits" (
	"key" text PRIMARY KEY,
	"count" integer DEFAULT 1 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "akoma_reactions" (
	"from_id" uuid,
	"to_id" uuid,
	"liked" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "akoma_reactions_pkey" PRIMARY KEY("from_id","to_id")
);
--> statement-breakpoint
CREATE TABLE "akoma_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"reporter_id" uuid,
	"subject_id" uuid,
	"subject_name" text NOT NULL,
	"reason" text NOT NULL,
	"details" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "akoma_match_pair_idx" ON "akoma_matches" ("first_id","second_id");--> statement-breakpoint
CREATE INDEX "akoma_messages_match_idx" ON "akoma_messages" ("match_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "akoma_message_retry_idx" ON "akoma_messages" ("sender_id","client_id");--> statement-breakpoint
CREATE UNIQUE INDEX "akoma_one_pending_payment_idx" ON "akoma_payments" ("user_id") WHERE "status" = 'pending';--> statement-breakpoint
CREATE INDEX "akoma_discovery_idx" ON "akoma_profiles" ("city","paused","suspended");--> statement-breakpoint
ALTER TABLE "akoma_blocks" ADD CONSTRAINT "akoma_blocks_from_id_akoma_profiles_id_fkey" FOREIGN KEY ("from_id") REFERENCES "akoma_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "akoma_blocks" ADD CONSTRAINT "akoma_blocks_to_id_akoma_profiles_id_fkey" FOREIGN KEY ("to_id") REFERENCES "akoma_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "akoma_matches" ADD CONSTRAINT "akoma_matches_first_id_akoma_profiles_id_fkey" FOREIGN KEY ("first_id") REFERENCES "akoma_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "akoma_matches" ADD CONSTRAINT "akoma_matches_second_id_akoma_profiles_id_fkey" FOREIGN KEY ("second_id") REFERENCES "akoma_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "akoma_messages" ADD CONSTRAINT "akoma_messages_match_id_akoma_matches_id_fkey" FOREIGN KEY ("match_id") REFERENCES "akoma_matches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "akoma_messages" ADD CONSTRAINT "akoma_messages_sender_id_akoma_profiles_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "akoma_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "akoma_payments" ADD CONSTRAINT "akoma_payments_user_id_akoma_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "akoma_profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "akoma_reactions" ADD CONSTRAINT "akoma_reactions_from_id_akoma_profiles_id_fkey" FOREIGN KEY ("from_id") REFERENCES "akoma_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "akoma_reactions" ADD CONSTRAINT "akoma_reactions_to_id_akoma_profiles_id_fkey" FOREIGN KEY ("to_id") REFERENCES "akoma_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "akoma_reports" ADD CONSTRAINT "akoma_reports_reporter_id_akoma_profiles_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "akoma_profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "akoma_reports" ADD CONSTRAINT "akoma_reports_subject_id_akoma_profiles_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "akoma_profiles"("id") ON DELETE SET NULL;