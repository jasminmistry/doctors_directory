ALTER TABLE `claim_requests`
  ADD COLUMN `consentzClinicId` INT NULL,
  ADD COLUMN `consentzUserId` INT NULL,
  ADD COLUMN `consentzUsername` VARCHAR(100) NULL,
  ADD COLUMN `mustResetPassword` TINYINT(1) NOT NULL DEFAULT 0;
