-- AlterTable: add contactReason, relax patientName/patientPhone to nullable for
-- simplified unclaimed-clinic enquiries (no name collected, phone optional).
ALTER TABLE `consultation_leads`
  ADD COLUMN `contactReason` VARCHAR(80) NULL,
  MODIFY `patientName` VARCHAR(200) NULL,
  MODIFY `patientPhone` VARCHAR(30) NULL;
