-- Block duplicate coreClinicId: one Consentz clinic can only link to one directory listing.
-- Enforces the one-to-one mapping at the DB level so the application-layer checks have a
-- hard backstop.
ALTER TABLE `clinics`
  ADD UNIQUE INDEX `clinics_coreClinicId_key` (`coreClinicId`);
