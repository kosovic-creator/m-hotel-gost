-- Step 1: Add new column sobaBroj as nullable
ALTER TABLE "Rezervacija" ADD COLUMN "sobaBroj" TEXT;

-- Step 2: Populate sobaBroj from existing sobaId by joining with Soba table
UPDATE "Rezervacija" r
SET "sobaBroj" = s."broj"
FROM "Soba" s
WHERE r."sobaId" = s."id";

-- Step 3: Make sobaBroj NOT NULL
ALTER TABLE "Rezervacija" ALTER COLUMN "sobaBroj" SET NOT NULL;

-- Step 4: Drop old column sobaId
ALTER TABLE "Rezervacija" DROP COLUMN "sobaId";

-- Step 5: Add exclusion constraint for overlapping reservations
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Rezervacija"
ADD CONSTRAINT rezervacija_no_overlap
EXCLUDE USING gist (
  "sobaBroj" WITH =,
  tsrange("prijava", "odjava", '[)') WITH &&
)
WHERE (status IN ('pending', 'confirmed'));
