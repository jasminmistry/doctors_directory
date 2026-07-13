-- AlterTable
ALTER TABLE `platform_reviews` ADD COLUMN `patientId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `platform_reviews_clinicId_patientId_key` ON `platform_reviews`(`clinicId`, `patientId`);

-- AddForeignKey
ALTER TABLE `platform_reviews` ADD CONSTRAINT `platform_reviews_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
