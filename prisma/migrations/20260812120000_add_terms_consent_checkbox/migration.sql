-- AlterTable
ALTER TABLE `patient_consents` MODIFY `checkbox` ENUM('share', 'privacy', 'age', 'terms') NOT NULL;
