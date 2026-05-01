/*
  Warnings:

  - You are about to alter the column `mhraApproved` on the `products` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(255)`.
  - You are about to alter the column `ceMarked` on the `products` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(255)`.

*/
-- DropIndex
DROP INDEX `practitioners_displayName_idx` ON `practitioners`;

-- AlterTable
ALTER TABLE `cities` MODIFY `primaryRegulator` TEXT NULL;

-- AlterTable
ALTER TABLE `clinics` MODIFY `gmapsPhone` VARCHAR(200) NULL;

-- AlterTable
ALTER TABLE `practitioners` MODIFY `displayName` TEXT NULL,
    MODIFY `title` TEXT NULL;

-- AlterTable
ALTER TABLE `products` MODIFY `productCategory` VARCHAR(255) NULL,
    MODIFY `productSubcategory` VARCHAR(255) NULL,
    MODIFY `manufacturer` TEXT NULL,
    MODIFY `sku` VARCHAR(255) NULL,
    MODIFY `treatmentDuration` TEXT NULL,
    MODIFY `onsetOfEffect` TEXT NULL,
    MODIFY `mhraApproved` VARCHAR(255) NULL,
    MODIFY `ceMarked` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `practitioners_displayName_idx` ON `practitioners`(`displayName`(191));
