-- AlterTable
ALTER TABLE `consultation_leads`
  ADD COLUMN `notificationEmailTo` VARCHAR(255) NULL,
  ADD COLUMN `notificationEmailSentAt` DATETIME(3) NULL,
  ADD COLUMN `notificationEmailReadAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `campaignEmailReadAt` DATETIME(3) NULL;
