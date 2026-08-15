-- AlterTable
ALTER TABLE `patients` ADD COLUMN `consentzPassword` VARCHAR(255) NULL,
    ADD COLUMN `consentzRefreshExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `consentzRefreshToken` VARCHAR(512) NULL,
    ADD COLUMN `consentzSessionExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `consentzSessionToken` VARCHAR(512) NULL;
