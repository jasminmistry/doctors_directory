-- AlterTable
ALTER TABLE `consultation_leads`
  ADD COLUMN `notificationSmsTo` VARCHAR(20) NULL,
  ADD COLUMN `notificationSmsSid` VARCHAR(64) NULL,
  ADD COLUMN `notificationSmsStatus` VARCHAR(20) NULL,
  ADD COLUMN `notificationSmsSentAt` DATETIME(3) NULL,
  ADD COLUMN `notificationSmsDeliveredAt` DATETIME(3) NULL,
  ADD COLUMN `notificationSmsReadAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `consultation_leads_notificationSmsSid_idx` ON `consultation_leads`(`notificationSmsSid`);

-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `smsNotifyMode` VARCHAR(10) NULL;
