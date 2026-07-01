-- Add coreUnlinkRequestedAt to clinics so clinic owners can request Core account unlinking
-- and admins can review and action the request.
ALTER TABLE `clinics`
  ADD COLUMN `coreUnlinkRequestedAt` DATETIME(3) NULL;
