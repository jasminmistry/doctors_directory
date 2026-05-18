-- AlterTable
ALTER TABLE `claim_requests` ADD COLUMN `clinicPhone` VARCHAR(50) NULL,
    ADD COLUMN `clinicWebsite` VARCHAR(500) NULL,
    ADD COLUMN `googleBusinessLink` VARCHAR(500) NULL;
