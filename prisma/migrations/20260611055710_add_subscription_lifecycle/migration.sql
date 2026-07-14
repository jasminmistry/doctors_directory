-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `stripeSubscriptionStatus` VARCHAR(50) NULL,
    ADD COLUMN `subscriptionCancelAt` DATETIME(3) NULL;
