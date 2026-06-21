CREATE TABLE "community_people" (
	"jid" text PRIMARY KEY NOT NULL,
	"contact_id" uuid,
	"display_name" text,
	"notes" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "community_people" ADD CONSTRAINT "community_people_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "community_people_contact_idx" ON "community_people" USING btree ("contact_id");