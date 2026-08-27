-- Self-serve GDPR account deletion: adds `deleted` claim status and a
-- scheduledDeletionAt grace-period timestamp on clinics/practitioners.

ALTER TABLE `claim_requests` MODIFY `status` ENUM('pending_otp','otp_verified','pending_approval','approved','rejected','awaiting_consentz_link','deleted') NOT NULL DEFAULT 'pending_otp';

ALTER TABLE `clinics` ADD COLUMN `scheduledDeletionAt` DATETIME(3) NULL;

ALTER TABLE `practitioners` ADD COLUMN `scheduledDeletionAt` DATETIME(3) NULL;
