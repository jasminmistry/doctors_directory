/*
  Warnings:

  - You are about to drop the column `companiesHouseNumber` on the `claim_requests` table. All the data in the column will be lost.
  - You are about to drop the column `emailToken` on the `claim_requests` table. All the data in the column will be lost.
  - You are about to drop the column `emailTokenExpiresAt` on the `claim_requests` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedAt` on the `claim_requests` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `claim_requests` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(7))`.

*/
-- AlterTable
ALTER TABLE `claim_requests` DROP COLUMN `companiesHouseNumber`,
    DROP COLUMN `emailToken`,
    DROP COLUMN `emailTokenExpiresAt`,
    DROP COLUMN `emailVerifiedAt`,
    ADD COLUMN `affiliated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `clinicNameInput` VARCHAR(255) NULL,
    ADD COLUMN `domainVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `entityType` ENUM('clinic', 'practitioner') NOT NULL DEFAULT 'clinic',
    ADD COLUMN `licenseNumber` VARCHAR(100) NULL,
    ADD COLUMN `otpCode` VARCHAR(10) NULL,
    ADD COLUMN `otpExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `otpVerifiedAt` DATETIME(3) NULL,
    ADD COLUMN `practitionerId` INTEGER NULL,
    ADD COLUMN `practitionerSlug` VARCHAR(255) NULL,
    ADD COLUMN `profession` VARCHAR(255) NULL,
    ADD COLUMN `registryName` VARCHAR(255) NULL,
    MODIFY `clinicId` INTEGER NULL,
    MODIFY `clinicSlug` VARCHAR(255) NULL,
    MODIFY `status` ENUM('pending_otp', 'otp_verified', 'pending_approval', 'approved', 'rejected') NOT NULL DEFAULT 'pending_otp';

-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `domainVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `gbpMatch` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `gbpVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `idVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `manualVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `practitioners` ADD COLUMN `affiliated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `claimed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `claimedAt` DATETIME(3) NULL,
    ADD COLUMN `claimedPlan` ENUM('free', 'pay_per_lead', 'subscription') NULL,
    ADD COLUMN `idVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `licensed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `manualVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `claim_requests_practitionerId_idx` ON `claim_requests`(`practitionerId`);

-- AddForeignKey
ALTER TABLE `claim_requests` ADD CONSTRAINT `claim_requests_practitionerId_fkey` FOREIGN KEY (`practitionerId`) REFERENCES `practitioners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
