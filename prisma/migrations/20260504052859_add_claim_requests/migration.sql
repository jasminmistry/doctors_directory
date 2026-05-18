-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `claimed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `claimedAt` DATETIME(3) NULL,
    ADD COLUMN `claimedPlan` ENUM('free', 'pay_per_lead', 'subscription') NULL;

-- CreateTable
CREATE TABLE `claim_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicId` INTEGER NOT NULL,
    `clinicSlug` VARCHAR(255) NOT NULL,
    `claimerName` VARCHAR(255) NOT NULL,
    `claimerEmail` VARCHAR(255) NOT NULL,
    `emailToken` VARCHAR(255) NULL,
    `emailTokenExpiresAt` DATETIME(3) NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `companiesHouseNumber` VARCHAR(100) NULL,
    `requiresManualReview` BOOLEAN NOT NULL DEFAULT false,
    `selectedPlan` ENUM('free', 'pay_per_lead', 'subscription') NULL,
    `stripeSessionId` VARCHAR(255) NULL,
    `stripeCustomerId` VARCHAR(255) NULL,
    `stripeSubscriptionId` VARCHAR(255) NULL,
    `status` ENUM('pending_email', 'email_verified', 'pending_approval', 'approved', 'rejected') NOT NULL DEFAULT 'pending_email',
    `adminNotes` TEXT NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `claim_requests_clinicId_idx`(`clinicId`),
    INDEX `claim_requests_status_idx`(`status`),
    INDEX `claim_requests_claimerEmail_idx`(`claimerEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `claim_requests` ADD CONSTRAINT `claim_requests_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
