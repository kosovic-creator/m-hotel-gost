-- Update postojećih rezervacija da imaju popust = 0 umesto NULL
UPDATE "Rezervacija"
SET "popust" = 0
WHERE "popust" IS NULL;