-- CreateTable
CREATE TABLE `featured_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicSlug` VARCHAR(255) NOT NULL,
    `position` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `featured_profiles_clinicSlug_key`(`clinicSlug`),
    INDEX `featured_profiles_position_idx`(`position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
