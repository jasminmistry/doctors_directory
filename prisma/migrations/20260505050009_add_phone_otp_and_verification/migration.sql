-- AlterTable
ALTER TABLE `claim_requests` ADD COLUMN `claimerPhone` VARCHAR(50) NULL,
    ADD COLUMN `contactMethod` ENUM('email', 'phone') NOT NULL DEFAULT 'email';

-- CreateTable
CREATE TABLE `verification_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entityType` ENUM('clinic', 'practitioner') NOT NULL,
    `entitySlug` VARCHAR(255) NOT NULL,
    `claimerName` VARCHAR(255) NOT NULL,
    `claimerEmail` VARCHAR(255) NOT NULL,
    `govIdFile` VARCHAR(255) NULL,
    `selfieFile` VARCHAR(255) NULL,
    `proofType` VARCHAR(50) NULL,
    `proofFile` VARCHAR(255) NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `adminNotes` TEXT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `verification_requests_entitySlug_idx`(`entitySlug`),
    INDEX `verification_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
