-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `stripeCustomerId` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `consultation_leads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicId` INTEGER NOT NULL,
    `patientName` VARCHAR(200) NOT NULL,
    `patientPhone` VARCHAR(30) NOT NULL,
    `patientEmail` VARCHAR(255) NULL,
    `treatment` VARCHAR(255) NULL,
    `preferredTime` VARCHAR(100) NULL,
    `location` VARCHAR(255) NULL,
    `status` ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
    `isUnlocked` BOOLEAN NOT NULL DEFAULT false,
    `unlockedAt` DATETIME(3) NULL,
    `stripePaymentIntentId` VARCHAR(255) NULL,
    `isGhostLead` BOOLEAN NOT NULL DEFAULT false,
    `ghostNotifiedAt` DATETIME(3) NULL,
    `seenAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `consultation_leads_clinicId_idx`(`clinicId`),
    INDEX `consultation_leads_isUnlocked_idx`(`isUnlocked`),
    INDEX `consultation_leads_seenAt_idx`(`seenAt`),
    INDEX `consultation_leads_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `consultation_leads` ADD CONSTRAINT `consultation_leads_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
