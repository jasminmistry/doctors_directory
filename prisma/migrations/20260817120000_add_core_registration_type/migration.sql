-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `coreRegistrationType` ENUM('new_registration', 'existing_link') NULL;

-- AlterTable
ALTER TABLE `practitioners` ADD COLUMN `coreRegistrationType` ENUM('new_registration', 'existing_link') NULL;

-- Backfill from claim_requests: linkToken set => claimant already had a Core account
-- (consentz-link flow); linkToken null => a new Core account was provisioned on approval.
UPDATE `clinics` c
JOIN `claim_requests` cr ON cr.`clinicId` = c.`id` AND cr.`status` = 'approved'
SET c.`coreRegistrationType` = IF(cr.`linkToken` IS NOT NULL, 'existing_link', 'new_registration')
WHERE c.`coreClinicId` IS NOT NULL AND c.`coreRegistrationType` IS NULL;

UPDATE `practitioners` p
JOIN `claim_requests` cr ON cr.`practitionerId` = p.`id` AND cr.`status` = 'approved'
SET p.`coreRegistrationType` = IF(cr.`linkToken` IS NOT NULL, 'existing_link', 'new_registration')
WHERE p.`coreClinicId` IS NOT NULL AND p.`coreRegistrationType` IS NULL;
