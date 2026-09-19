CREATE TABLE "coupon_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"batch" text NOT NULL,
	"value_cents" integer NOT NULL,
	"sent_at" timestamp with time zone,
	"sent_to" text,
	"redeemed_at" timestamp with time zone,
	"checked_at" timestamp with time zone,
	"check_status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupon_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX "coupon_codes_batch_idx" ON "coupon_codes" USING btree ("batch");--> statement-breakpoint
CREATE INDEX "coupon_codes_claimable_idx" ON "coupon_codes" USING btree ("sent_at","redeemed_at");--> statement-breakpoint
CREATE INDEX "coupon_codes_stale_idx" ON "coupon_codes" USING btree ("checked_at");