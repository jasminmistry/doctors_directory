-- AlterTable
ALTER TABLE `clinics`
    ADD COLUMN `downgradeToPlan` ENUM('free', 'pay_per_lead', 'subscription') NULL;

-- AlterTable
ALTER TABLE `practitioners`
    ADD COLUMN `stripeCustomerId` VARCHAR(255) NULL,
    ADD COLUMN `stripeSubscriptionStatus` VARCHAR(50) NULL,
    ADD COLUMN `subscriptionCancelAt` DATETIME(3) NULL,
    ADD COLUMN `downgradeToPlan` ENUM('free', 'pay_per_lead', 'subscription') NULL;
