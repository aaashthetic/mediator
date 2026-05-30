ALTER TABLE "doctors" ADD COLUMN "consultation_fee" numeric(10, 2) DEFAULT '500.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "medical_practice_start_date" timestamp NOT NULL;