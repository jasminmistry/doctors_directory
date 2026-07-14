-- Drop OTP table — replaced by magic link auth
DROP TABLE IF EXISTS `patient_otps`;

-- CreateTable
CREATE TABLE `patient_magic_links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tokenHash` VARCHAR(64) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `next` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `patient_magic_links_tokenHash_key`(`tokenHash`),
    INDEX `patient_magic_links_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_oauth_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `provider` VARCHAR(20) NOT NULL,
    `providerAccountId` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,

    UNIQUE INDEX `patient_oauth_accounts_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    INDEX `patient_oauth_accounts_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patient_oauth_accounts` ADD CONSTRAINT `patient_oauth_accounts_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
