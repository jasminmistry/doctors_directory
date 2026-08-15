-- AlterTable
ALTER TABLE `consultation_leads` ADD COLUMN `source` ENUM('consultation', 'pricing') NOT NULL DEFAULT 'consultation';
