-- Add Consentz link token fields to ClaimRequest for the "already a Consentz user" claiming flow
ALTER TABLE `claim_requests`
  ADD COLUMN `linkToken`          VARCHAR(80)  NULL,
  ADD COLUMN `linkTokenExpiresAt` DATETIME(3)  NULL,
  ADD COLUMN `linkTokenUsed`      TINYINT(1)   NOT NULL DEFAULT 0,
  ADD UNIQUE INDEX `claim_requests_linkToken_key` (`linkToken`);

-- Add awaiting_consentz_link to the ClaimStatus enum
ALTER TABLE `claim_requests`
  MODIFY COLUMN `status` ENUM(
    'pending_otp',
    'otp_verified',
    'pending_approval',
    'approved',
    'rejected',
    'awaiting_consentz_link'
  ) NOT NULL DEFAULT 'pending_otp';
