ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "rental_rate" integer DEFAULT 85,
  ADD COLUMN IF NOT EXISTS "rental_badge" text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS "rental_rate_updated_at" timestamp;

ALTER TABLE "items"
  ADD COLUMN IF NOT EXISTS "cleaning_buffer_days" integer NOT NULL DEFAULT 0;

ALTER TABLE "reviews"
  ADD COLUMN IF NOT EXISTS "review_type" text DEFAULT 'renter_to_host';

CREATE TABLE IF NOT EXISTS "host_rental_rate_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "host_id" text NOT NULL REFERENCES "user"("id"),
  "rental_id" uuid REFERENCES "rentals"("id"),
  "event_type" text NOT NULL,
  "delta" integer NOT NULL,
  "before_rate" integer NOT NULL,
  "after_rate" integer NOT NULL,
  "created_at" timestamp DEFAULT now()
);
