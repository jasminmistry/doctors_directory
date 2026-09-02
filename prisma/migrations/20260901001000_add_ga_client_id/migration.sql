-- AlterTable
ALTER TABLE `claim_requests` ADD COLUMN `gaClientId` VARCHAR(64) NULL;

-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `gaClientId` VARCHAR(64) NULL;

-- AlterTable
ALTER TABLE `practitioners` ADD COLUMN `gaClientId` VARCHAR(64) NULL;
