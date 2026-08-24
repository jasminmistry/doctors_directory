-- Point 6 follow-up: Dax feedback — remove retired Gerson Medical,
-- drop De Felipe London duplicate (-1), rename Clinic Aesthetics → Clinicat.

DELETE FROM `clinics` WHERE `slug` = 'gerson-medical';
DELETE FROM `clinics` WHERE `slug` = 'de-felipe-dermatology-clinic-london-1';

UPDATE `clinics`
SET
  `name` = 'Clinicat',
  `aboutSection` = 'Clinicat is a Consentz customer clinic listed in the UK Aesthetic Directory.',
  `website` = COALESCE(NULLIF(`website`, ''), 'https://clinicat.co.uk/'),
  `updatedAt` = NOW(3)
WHERE `slug` = 'clinic-aesthetics';
