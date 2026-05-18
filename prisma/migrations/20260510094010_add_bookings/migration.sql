-- CreateTable
CREATE TABLE `bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicId` INTEGER NOT NULL,
    `coreBookingId` VARCHAR(255) NULL,
    `patientName` VARCHAR(200) NOT NULL,
    `patientPhone` VARCHAR(30) NOT NULL,
    `patientEmail` VARCHAR(255) NULL,
    `treatment` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `slotStart` DATETIME(3) NOT NULL,
    `slotEnd` DATETIME(3) NOT NULL,
    `status` ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending',
    `stripePaymentIntentId` VARCHAR(255) NULL,
    `depositAmount` DECIMAL(10, 2) NULL,
    `syncedFromCore` BOOLEAN NOT NULL DEFAULT false,
    `lastSyncedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bookings_coreBookingId_key`(`coreBookingId`),
    INDEX `bookings_clinicId_idx`(`clinicId`),
    INDEX `bookings_slotStart_idx`(`slotStart`),
    INDEX `bookings_status_idx`(`status`),
    INDEX `bookings_coreBookingId_idx`(`coreBookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
