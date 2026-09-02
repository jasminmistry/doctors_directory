-- AlterTable
ALTER TABLE `claim_requests` ADD COLUMN `attributionLandingPage` VARCHAR(512) NULL,
    ADD COLUMN `attributionReferrer` VARCHAR(512) NULL,
    ADD COLUMN `attributionSource` VARCHAR(32) NULL,
    ADD COLUMN `utmCampaign` VARCHAR(191) NULL,
    ADD COLUMN `utmMedium` VARCHAR(128) NULL,
    ADD COLUMN `utmSource` VARCHAR(128) NULL;

-- CreateIndex
CREATE INDEX `claim_requests_attributionSource_idx` ON `claim_requests`(`attributionSource`);
