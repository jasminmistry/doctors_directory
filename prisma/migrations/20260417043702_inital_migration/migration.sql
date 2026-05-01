-- CreateTable
CREATE TABLE `cities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(120) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `populationEstimate` VARCHAR(255) NULL,
    `lifestyleCharacteristics` TEXT NULL,
    `medicalInfrastructurePresence` TEXT NULL,
    `numClinics` INTEGER NULL DEFAULT 0,
    `reviewVolumeTotal` INTEGER NULL DEFAULT 0,
    `averageRatingCitywide` DECIMAL(3, 2) NULL,
    `estimatedMarketStrength` VARCHAR(100) NULL,
    `nhsPresence` TEXT NULL,
    `primaryRegulator` VARCHAR(255) NULL,
    `prescribingRequirements` TEXT NULL,
    `inspectionFramework` TEXT NULL,
    `privateInsuranceUsage` TEXT NULL,
    `cosmeticFinanceAvailability` TEXT NULL,
    `teachingHospitalLinks` TEXT NULL,
    `publicTransportProximity` TEXT NULL,
    `parkingAvailability` TEXT NULL,
    `cityVsSuburbanDistribution` TEXT NULL,
    `tourismVolumeIndicator` TEXT NULL,
    `hotelDensityNearClinics` TEXT NULL,
    `airportProximity` TEXT NULL,
    `medicalTourismViability` TEXT NULL,
    `marketMaturityLevel` TEXT NULL,
    `specializations` JSON NULL,
    `peakBookingPeriods` JSON NULL,
    `socialMediaTrends` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cities_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `cityId` INTEGER NULL,
    `name` VARCHAR(255) NULL,
    `image` TEXT NULL,
    `gmapsUrl` TEXT NULL,
    `gmapsAddress` VARCHAR(500) NULL,
    `gmapsPhone` VARCHAR(50) NULL,
    `category` VARCHAR(100) NULL,
    `rating` DECIMAL(3, 2) NULL,
    `reviewCount` INTEGER NULL DEFAULT 0,
    `aboutSection` TEXT NULL,
    `accreditations` TEXT NULL,
    `awards` TEXT NULL,
    `affiliations` TEXT NULL,
    `website` VARCHAR(500) NULL,
    `email` VARCHAR(255) NULL,
    `facebook` VARCHAR(500) NULL,
    `twitter` VARCHAR(500) NULL,
    `xTwitter` VARCHAR(500) NULL,
    `instagram` VARCHAR(500) NULL,
    `youtube` VARCHAR(500) NULL,
    `linkedin` VARCHAR(500) NULL,
    `isSaveFace` BOOLEAN NOT NULL DEFAULT false,
    `isDoctor` BOOLEAN NOT NULL DEFAULT false,
    `isJccp` BOOLEAN NOT NULL DEFAULT false,
    `jccpUrl` VARCHAR(500) NULL,
    `isCqc` BOOLEAN NOT NULL DEFAULT false,
    `cqcUrl` VARCHAR(500) NULL,
    `isHiw` BOOLEAN NOT NULL DEFAULT false,
    `hiwUrl` VARCHAR(500) NULL,
    `isHis` BOOLEAN NOT NULL DEFAULT false,
    `hisUrl` VARCHAR(500) NULL,
    `isRqia` BOOLEAN NOT NULL DEFAULT false,
    `rqiaUrl` VARCHAR(500) NULL,
    `insuranceInfo` JSON NULL,
    `paymentMethods` JSON NULL,
    `reviewAnalysis` JSON NULL,
    `weightedAnalysis` JSON NULL,
    `criteriaBreakdown` JSON NULL,
    `advice` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clinics_slug_key`(`slug`),
    INDEX `clinics_cityId_idx`(`cityId`),
    INDEX `clinics_rating_idx`(`rating`),
    INDEX `clinics_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_hours` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicId` INTEGER NOT NULL,
    `dayOfWeek` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    `hours` VARCHAR(100) NULL,

    UNIQUE INDEX `clinic_hours_clinicId_dayOfWeek_key`(`clinicId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_fees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicId` INTEGER NOT NULL,
    `treatmentName` VARCHAR(255) NOT NULL,
    `price` VARCHAR(100) NULL,

    INDEX `clinic_fees_clinicId_idx`(`clinicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicId` INTEGER NOT NULL,
    `reviewerName` VARCHAR(255) NULL,
    `rating` DECIMAL(2, 1) NULL,
    `reviewDate` VARCHAR(100) NULL,
    `reviewText` TEXT NULL,
    `ownerResponse` TEXT NULL,

    INDEX `clinic_reviews_clinicId_idx`(`clinicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_rankings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicId` INTEGER NOT NULL,
    `cityRank` SMALLINT NULL,
    `cityTotal` SMALLINT NULL,
    `scoreOutOf100` TINYINT NULL,
    `subtitleText` VARCHAR(255) NULL,

    UNIQUE INDEX `clinic_rankings_clinicId_key`(`clinicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_staff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicId` INTEGER NOT NULL,
    `fullName` VARCHAR(255) NULL,
    `title` VARCHAR(255) NULL,
    `specialty` TEXT NULL,
    `linkedinUrl` VARCHAR(500) NULL,
    `profileUrl` VARCHAR(500) NULL,
    `practitionerId` INTEGER NULL,

    INDEX `clinic_staff_clinicId_idx`(`clinicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_treatments` (
    `clinicId` INTEGER NOT NULL,
    `treatmentId` INTEGER NOT NULL,

    PRIMARY KEY (`clinicId`, `treatmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treatments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `goals` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `treatments_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `practitioners` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `displayName` VARCHAR(255) NULL,
    `title` VARCHAR(255) NULL,
    `specialty` VARCHAR(255) NULL,
    `imageUrl` TEXT NULL,
    `qualifications` JSON NULL,
    `roles` JSON NULL,
    `awards` JSON NULL,
    `media` JSON NULL,
    `experience` JSON NULL,
    `weightedAnalysis` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `practitioners_slug_key`(`slug`),
    INDEX `practitioners_displayName_idx`(`displayName`),
    INDEX `practitioners_specialty_idx`(`specialty`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `practitioner_rankings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `practitionerId` INTEGER NOT NULL,
    `cityRank` SMALLINT NULL,
    `cityTotal` SMALLINT NULL,
    `scoreOutOf100` TINYINT NULL,
    `subtitleText` VARCHAR(255) NULL,

    UNIQUE INDEX `practitioner_rankings_practitionerId_key`(`practitionerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `practitioner_clinic_associations` (
    `practitionerId` INTEGER NOT NULL,
    `clinicId` INTEGER NOT NULL,

    PRIMARY KEY (`practitionerId`, `clinicId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `practitioner_treatments` (
    `practitionerId` INTEGER NOT NULL,
    `treatmentId` INTEGER NOT NULL,

    PRIMARY KEY (`practitionerId`, `treatmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `productName` VARCHAR(255) NOT NULL,
    `productCategory` VARCHAR(100) NULL,
    `productSubcategory` VARCHAR(100) NULL,
    `category` VARCHAR(100) NULL,
    `brand` VARCHAR(255) NULL,
    `manufacturer` VARCHAR(255) NULL,
    `distributor` VARCHAR(500) NULL,
    `distributorCleaned` VARCHAR(255) NULL,
    `sku` VARCHAR(100) NULL,
    `imageUrl` TEXT NULL,
    `documentPdfUrl` TEXT NULL,
    `description` TEXT NULL,
    `treatmentDuration` VARCHAR(255) NULL,
    `onsetOfEffect` VARCHAR(255) NULL,
    `mhraApproved` BOOLEAN NULL,
    `ceMarked` BOOLEAN NULL,
    `mhraLink` VARCHAR(500) NULL,
    `brandAbout` TEXT NULL,
    `sellerAbout` TEXT NULL,
    `sourceVerifiedOn` DATE NULL,
    `dataConfidenceScore` DECIMAL(5, 2) NULL,
    `isAestheticsDermatologyRelated` BOOLEAN NULL,
    `keyBenefits` JSON NULL,
    `indications` JSON NULL,
    `composition` JSON NULL,
    `formulation` JSON NULL,
    `packaging` JSON NULL,
    `usageInstructions` JSON NULL,
    `contraindications` JSON NULL,
    `adverseEffects` JSON NULL,
    `storageConditions` JSON NULL,
    `certifications` JSON NULL,
    `verificationSources` JSON NULL,
    `allPrices` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    INDEX `products_brand_idx`(`brand`),
    INDEX `products_productCategory_idx`(`productCategory`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accreditation_bodies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `image` MEDIUMTEXT NULL,
    `overviewDescription` TEXT NULL,
    `foundedYear` VARCHAR(20) NULL,
    `founder` VARCHAR(255) NULL,
    `purpose` TEXT NULL,
    `governingOrgName` VARCHAR(255) NULL,
    `companyStatus` VARCHAR(100) NULL,
    `regulatoryStatus` VARCHAR(100) NULL,
    `industryStanding` TEXT NULL,
    `eligibilityWhoCanApply` TEXT NULL,
    `inspectionRequired` VARCHAR(100) NULL,
    `publicRegister` VARCHAR(255) NULL,
    `certificateValidationMethod` TEXT NULL,
    `renewalFrequency` VARCHAR(100) NULL,
    `cpdRequirements` TEXT NULL,
    `auditProcess` TEXT NULL,
    `reputation` TEXT NULL,
    `patientTrustImpact` TEXT NULL,
    `statutoryBacking` TEXT NULL,
    `regulatedBy` VARCHAR(255) NULL,
    `legalStatus` VARCHAR(100) NULL,
    `eligibilityRequirements` JSON NULL,
    `eligibilityRestrictions` JSON NULL,
    `evaluationFactors` JSON NULL,
    `availableCategories` JSON NULL,
    `documentationRequired` JSON NULL,
    `complianceStandards` JSON NULL,
    `protectionMechanisms` JSON NULL,
    `limitations` JSON NULL,
    `comparableEntities` JSON NULL,
    `keyDifferences` JSON NULL,
    `mediaMentions` JSON NULL,
    `endorsements` JSON NULL,
    `credibilitySignals` JSON NULL,
    `faqs` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `accreditation_bodies_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pending_clinics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `submittedData` LONGTEXT NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `reviewerNotes` TEXT NULL,

    INDEX `pending_clinics_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pending_practitioners` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `submittedData` LONGTEXT NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `reviewerNotes` TEXT NULL,

    INDEX `pending_practitioners_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clinics` ADD CONSTRAINT `clinics_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `cities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_hours` ADD CONSTRAINT `clinic_hours_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_fees` ADD CONSTRAINT `clinic_fees_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_reviews` ADD CONSTRAINT `clinic_reviews_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_rankings` ADD CONSTRAINT `clinic_rankings_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_staff` ADD CONSTRAINT `clinic_staff_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_staff` ADD CONSTRAINT `clinic_staff_practitionerId_fkey` FOREIGN KEY (`practitionerId`) REFERENCES `practitioners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_treatments` ADD CONSTRAINT `clinic_treatments_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_treatments` ADD CONSTRAINT `clinic_treatments_treatmentId_fkey` FOREIGN KEY (`treatmentId`) REFERENCES `treatments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `practitioner_rankings` ADD CONSTRAINT `practitioner_rankings_practitionerId_fkey` FOREIGN KEY (`practitionerId`) REFERENCES `practitioners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `practitioner_clinic_associations` ADD CONSTRAINT `practitioner_clinic_associations_practitionerId_fkey` FOREIGN KEY (`practitionerId`) REFERENCES `practitioners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `practitioner_clinic_associations` ADD CONSTRAINT `practitioner_clinic_associations_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `practitioner_treatments` ADD CONSTRAINT `practitioner_treatments_practitionerId_fkey` FOREIGN KEY (`practitionerId`) REFERENCES `practitioners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `practitioner_treatments` ADD CONSTRAINT `practitioner_treatments_treatmentId_fkey` FOREIGN KEY (`treatmentId`) REFERENCES `treatments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
