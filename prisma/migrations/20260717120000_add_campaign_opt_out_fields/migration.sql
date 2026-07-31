-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `campaignEmailedAt` DATETIME(3) NULL,
    ADD COLUMN `campaignOptedOut` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `clinics_claimed_campaignOptedOut_campaignEmailedAt_idx` ON `clinics`(`claimed`, `campaignOptedOut`, `campaignEmailedAt`);
