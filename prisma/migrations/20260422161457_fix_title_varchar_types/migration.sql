-- DropIndex
DROP INDEX `practitioners_displayName_idx` ON `practitioners`;

-- AlterTable
ALTER TABLE `clinic_staff` MODIFY `title` VARCHAR(255) NULL,
    MODIFY `specialty` VARCHAR(255) NULL,
    MODIFY `profileUrl` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `practitioners` MODIFY `displayName` VARCHAR(255) NULL,
    MODIFY `title` VARCHAR(500) NULL;

-- CreateIndex
CREATE INDEX `practitioners_displayName_idx` ON `practitioners`(`displayName`);
