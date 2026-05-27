-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `avgReplyTime` ENUM('within_24hrs', 'within_48hrs', 'more_than_48hrs') NULL,
    ADD COLUMN `coverImage` TEXT NULL,
    ADD COLUMN `cqcStatus` ENUM('not_applicable', 'good', 'requires_improvement', 'outstanding') NULL;

-- CreateTable
CREATE TABLE `platform_reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicId` INTEGER NOT NULL,
    `patientName` VARCHAR(200) NOT NULL,
    `rating` TINYINT NOT NULL,
    `reviewText` TEXT NOT NULL,
    `treatment` VARCHAR(255) NULL,
    `isVerifiedPatient` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `clinicResponse` TEXT NULL,
    `respondedAt` DATETIME(3) NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `platform_reviews_clinicId_idx`(`clinicId`),
    INDEX `platform_reviews_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `platform_reviews` ADD CONSTRAINT `platform_reviews_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
