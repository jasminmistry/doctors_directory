-- Google Business Profile connector: directory<->GBP field mirror, per-clinic OAuth
-- connection, and the private-feedback review-collection flow.

-- AlterTable: GBP mirror fields on clinics
ALTER TABLE `clinics`
  ADD COLUMN `placeId` VARCHAR(255) NULL,
  ADD COLUMN `gbpPrimaryPhone` VARCHAR(50) NULL,
  ADD COLUMN `additionalPhones` JSON NULL,
  ADD COLUMN `gbpPrimaryCategoryId` VARCHAR(100) NULL,
  ADD COLUMN `gbpPrimaryCategoryName` VARCHAR(255) NULL,
  ADD COLUMN `gbpAdditionalCategories` JSON NULL,
  ADD COLUMN `gbpServiceArea` JSON NULL,
  ADD COLUMN `gbpBookingUrl` VARCHAR(1000) NULL,
  ADD COLUMN `gbpFieldsUpdatedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `gbp_connections` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `clinicId` INTEGER NOT NULL,
  `accessToken` TEXT NULL,
  `accessTokenExpiresAt` DATETIME(3) NULL,
  `refreshTokenCipher` TEXT NULL,
  `refreshTokenIv` VARCHAR(32) NULL,
  `refreshTokenTag` VARCHAR(32) NULL,
  `scope` VARCHAR(500) NULL,
  `googleEmail` VARCHAR(255) NULL,
  `accountName` VARCHAR(255) NULL,
  `locationName` VARCHAR(255) NULL,
  `locationV4Name` VARCHAR(255) NULL,
  `placeId` VARCHAR(255) NULL,
  `newReviewUri` VARCHAR(1000) NULL,
  `mapsUri` VARCHAR(1000) NULL,
  `status` ENUM('pending_location','connected','needs_reauth','revoked') NOT NULL DEFAULT 'pending_location',
  `lastPulledAt` DATETIME(3) NULL,
  `lastSyncedAt` DATETIME(3) NULL,
  `lastSyncError` TEXT NULL,
  `syncFieldState` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `gbp_connections_clinicId_key`(`clinicId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_addresses` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `clinicId` INTEGER NOT NULL,
  `regionCode` VARCHAR(2) NULL,
  `languageCode` VARCHAR(10) NULL,
  `postalCode` VARCHAR(20) NULL,
  `administrativeArea` VARCHAR(120) NULL,
  `locality` VARCHAR(120) NULL,
  `sublocality` VARCHAR(120) NULL,
  `addressLines` JSON NULL,
  `latitude` DECIMAL(9, 6) NULL,
  `longitude` DECIMAL(9, 6) NULL,
  `source` VARCHAR(20) NOT NULL DEFAULT 'manual',
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `clinic_addresses_clinicId_key`(`clinicId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_hour_periods` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `clinicId` INTEGER NOT NULL,
  `openDay` ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `openTime` VARCHAR(5) NOT NULL,
  `closeDay` ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `closeTime` VARCHAR(5) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  INDEX `clinic_hour_periods_clinicId_idx`(`clinicId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_services` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `clinicId` INTEGER NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1000) NULL,
  `priceUnits` INTEGER NULL,
  `priceNanos` INTEGER NULL,
  `currency` VARCHAR(3) NULL DEFAULT 'GBP',
  `categoryId` VARCHAR(100) NULL,
  `isFreeForm` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `source` VARCHAR(20) NOT NULL DEFAULT 'manual',
  INDEX `clinic_services_clinicId_idx`(`clinicId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_photos` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `clinicId` INTEGER NOT NULL,
  `url` TEXT NOT NULL,
  `category` ENUM('COVER','PROFILE','LOGO','EXTERIOR','INTERIOR','PRODUCT','AT_WORK','TEAMS','ADDITIONAL') NOT NULL DEFAULT 'ADDITIONAL',
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `gbpMediaName` VARCHAR(255) NULL,
  `gbpState` VARCHAR(30) NULL,
  `uploadError` TEXT NULL,
  `source` VARCHAR(20) NOT NULL DEFAULT 'manual',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `clinic_photos_clinicId_idx`(`clinicId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_requests` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `clinicId` INTEGER NOT NULL,
  `tokenHash` VARCHAR(64) NOT NULL,
  `patientName` VARCHAR(200) NULL,
  `patientEmail` VARCHAR(255) NULL,
  `channel` VARCHAR(10) NOT NULL DEFAULT 'link',
  `createdByClaimId` INTEGER NULL,
  `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `emailSentAt` DATETIME(3) NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  UNIQUE INDEX `review_requests_tokenHash_key`(`tokenHash`),
  INDEX `review_requests_clinicId_idx`(`clinicId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `private_feedback` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `clinicId` INTEGER NOT NULL,
  `reviewRequestId` INTEGER NULL,
  `rating` TINYINT NOT NULL,
  `comment` TEXT NOT NULL,
  `submitterName` VARCHAR(200) NULL,
  `ipHash` VARCHAR(64) NULL,
  `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `googlePromptShownAt` DATETIME(3) NULL,
  `googleReviewClickedAt` DATETIME(3) NULL,
  `publishedReviewId` INTEGER NULL,
  `publishedAt` DATETIME(3) NULL,
  UNIQUE INDEX `private_feedback_reviewRequestId_key`(`reviewRequestId`),
  UNIQUE INDEX `private_feedback_publishedReviewId_key`(`publishedReviewId`),
  INDEX `private_feedback_clinicId_idx`(`clinicId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gbp_connections` ADD CONSTRAINT `gbp_connections_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_addresses` ADD CONSTRAINT `clinic_addresses_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_hour_periods` ADD CONSTRAINT `clinic_hour_periods_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_services` ADD CONSTRAINT `clinic_services_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_photos` ADD CONSTRAINT `clinic_photos_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_requests` ADD CONSTRAINT `review_requests_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `private_feedback` ADD CONSTRAINT `private_feedback_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `private_feedback` ADD CONSTRAINT `private_feedback_reviewRequestId_fkey` FOREIGN KEY (`reviewRequestId`) REFERENCES `review_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
