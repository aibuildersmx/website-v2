ALTER TABLE "coupon_eligible" ADD COLUMN "coupon_id" uuid;--> statement-breakpoint
ALTER TABLE "coupon_eligible" ADD CONSTRAINT "coupon_eligible_coupon_id_coupon_codes_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupon_codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Backfill: guests who already claimed (Café Cursor CDMX) were found by sent_to.
UPDATE "coupon_eligible" e SET "coupon_id" = c."id" FROM "coupon_codes" c WHERE c."batch" = e."batch" AND c."sent_to" = e."email";
