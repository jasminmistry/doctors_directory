-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `isHidden` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `practitioners` ADD COLUMN `isHidden` BOOLEAN NOT NULL DEFAULT false;
