-- CreateTable
CREATE TABLE `patient_consents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NULL,
    `checkbox` ENUM('share', 'privacy', 'age') NOT NULL,
    `ticked` BOOLEAN NOT NULL,
    `wordingShown` TEXT NOT NULL,
    `formVersion` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `patient_consents_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patient_consents` ADD CONSTRAINT `patient_consents_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
