/*
  Warnings:

  - You are about to alter the column `specialty` on the `clinic_staff` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Json`.
  - You are about to alter the column `profileUrl` on the `clinic_staff` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `Json`.

*/
-- DropIndex
DROP INDEX `practitioners_displayName_idx` ON `practitioners`;

-- AlterTable
ALTER TABLE `clinic_staff` MODIFY `title` VARCHAR(300) NULL,
    MODIFY `specialty` JSON NULL,
    MODIFY `profileUrl` JSON NULL;

-- AlterTable
ALTER TABLE `practitioners` MODIFY `displayName` TEXT NULL,
    MODIFY `title` TEXT NULL;

-- CreateIndex
CREATE INDEX `practitioners_displayName_idx` ON `practitioners`(`displayName`(191));
