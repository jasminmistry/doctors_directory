-- AlterTable
ALTER TABLE `claim_requests` ADD COLUMN `isNewRegistration` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `newListingData` LONGTEXT NULL;

-- DropTable
DROP TABLE `pending_clinics`;

-- DropTable
DROP TABLE `pending_practitioners`;
