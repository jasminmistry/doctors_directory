-- Add coreClinicId to practitioners so Consentz-linked practitioner profiles can use the
-- calendar and booking APIs. Not unique: multiple practitioners can belong to the same
-- Consentz clinic.
ALTER TABLE `practitioners`
  ADD COLUMN `coreClinicId` INT NULL;
