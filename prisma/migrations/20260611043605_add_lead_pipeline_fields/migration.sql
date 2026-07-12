-- AlterTable
ALTER TABLE `consultation_leads` ADD COLUMN `coreSynced` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `ownerName` VARCHAR(100) NULL,
    ADD COLUMN `pipelineStatus` ENUM('new', 'contacted', 'booked', 'lost', 'spam', 'archived', 'closed') NOT NULL DEFAULT 'new',
    MODIFY `status` ENUM('new', 'contacted', 'booked', 'lost', 'spam', 'archived', 'closed') NOT NULL DEFAULT 'new';

-- CreateIndex
CREATE INDEX `consultation_leads_pipelineStatus_idx` ON `consultation_leads`(`pipelineStatus`);
