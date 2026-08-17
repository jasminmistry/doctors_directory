-- Seed Consentz Excel clinics for profile pages (MySQL)

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT '111-harley-st', c.id, '111 Harley St.', '/directory/images/default-dr-profile-1.webp', '111 Harley Street, London W1, United Kingdom', 'https://www.111harleystreet.com/', 'Aesthetic clinic', 0, 0, '111 Harley St. is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = '111-harley-st');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'liverpool', 'Liverpool', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'liverpool');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'aintree-aesthetics-limited', c.id, 'Aintree Aesthetics Limited', '/directory/images/default-dr-profile-1.webp', 'Aintree, Liverpool, United Kingdom', 'http://aintreeaesthetics.co.uk/', 'Aesthetic clinic', 0, 0, 'Aintree Aesthetics Limited is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'liverpool'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'aintree-aesthetics-limited');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'manchester', 'Manchester', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'manchester');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'adam-goodwin-surgery', c.id, 'Adam Goodwin Surgery', '/directory/images/default-dr-profile-1.webp', 'Manchester, United Kingdom', 'https://adamgoodwinsurgery.com/', 'Aesthetic clinic', 0, 0, 'Adam Goodwin Surgery is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'manchester'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'adam-goodwin-surgery');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'choice-aesthetics-bmi', c.id, 'Choice Aesthetics (BMI)', '/directory/images/default-dr-profile-1.webp', 'London / Surrey, United Kingdom', 'https://choiceaesthetic.com', 'Aesthetic clinic', 0, 0, 'Choice Aesthetics (BMI) is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'choice-aesthetics-bmi');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'clinic-aesthetics', c.id, 'Clinic Aesthetics', '/directory/images/default-dr-profile-1.webp', 'Harley Street, London, United Kingdom', 'https://clinicat.co.uk/', 'Aesthetic clinic', 0, 0, 'Clinic Aesthetics is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'clinic-aesthetics');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'dhi-london-dhi-global-medical-group', c.id, 'DHI London (DHI Global Medical Group)', '/directory/images/default-dr-profile-1.webp', 'London W1, United Kingdom', 'https://dhiglobal.com/', 'Aesthetic clinic', 0, 0, 'DHI London (DHI Global Medical Group) is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'dhi-london-dhi-global-medical-group');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'dr-brian-franks', c.id, 'Dr Brian Franks', '/directory/images/default-dr-profile-1.webp', 'London / Weybridge, United Kingdom', 'https://www.drbrianfranks.com/', 'Aesthetic clinic', 0, 0, 'Dr Brian Franks is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'dr-brian-franks');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'dr-hanson-clinic', c.id, 'Dr Hanson Clinic', '/directory/images/default-dr-profile-1.webp', 'Harley Street, London, United Kingdom', 'https://www.drhanson.co.uk/', 'Aesthetic clinic', 0, 0, 'Dr Hanson Clinic is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'dr-hanson-clinic');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'dr-harris-clinic', c.id, 'Dr Harris Clinic', '/directory/images/default-dr-profile-1.webp', 'London NW1, United Kingdom', 'https://harrisclinic.co.uk/', 'Aesthetic clinic', 0, 0, 'Dr Harris Clinic is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'dr-harris-clinic');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'bristol', 'Bristol', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'bristol');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'dr-paul-baines-skin-health-the-crescent-clinic', c.id, 'Dr Paul Baines - Skin Health (The Crescent Clinic)', '/directory/images/default-dr-profile-1.webp', 'Taunton, United Kingdom', 'https://www.drbaines.com/', 'Aesthetic clinic', 0, 0, 'Dr Paul Baines - Skin Health (The Crescent Clinic) is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'bristol'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'dr-paul-baines-skin-health-the-crescent-clinic');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'dr-rhys', c.id, 'DR RHYS', '/directory/images/default-dr-profile-1.webp', 'London / Tadworth, United Kingdom', 'https://www.drrhys.com/', 'Aesthetic clinic', 0, 0, 'DR RHYS is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'dr-rhys');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'eastbourne', 'Eastbourne', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'eastbourne');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'dr-ruthie-aesthetics', c.id, 'Dr Ruthie Aesthetics', '/directory/images/default-dr-profile-1.webp', 'East Sussex, United Kingdom', 'https://www.drruthie.co.uk/', 'Aesthetic clinic', 0, 0, 'Dr Ruthie Aesthetics is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'eastbourne'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'dr-ruthie-aesthetics');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'dr-veerle-rotsaert', c.id, 'Dr Veerle Rotsaert', '/directory/images/default-dr-profile-1.webp', 'Belgravia, London, United Kingdom', 'https://doctorv.co.uk/', 'Aesthetic clinic', 0, 0, 'Dr Veerle Rotsaert is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'dr-veerle-rotsaert');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'birmingham', 'Birmingham', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'birmingham');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'efface-aesthetics', c.id, 'Efface Aesthetics', '/directory/images/default-dr-profile-1.webp', 'Birmingham, United Kingdom', 'https://effaceaesthetics.com/', 'Aesthetic clinic', 0, 0, 'Efface Aesthetics is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'birmingham'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'efface-aesthetics');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'darlington', 'Darlington', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'darlington');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'face-et-al-medical-aesthetics', c.id, 'Face et al Medical Aesthetics', '/directory/images/default-dr-profile-1.webp', 'Darlington, United Kingdom', '', 'Aesthetic clinic', 0, 0, 'Face et al Medical Aesthetics is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'darlington'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'face-et-al-medical-aesthetics');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'gerson-medical', c.id, 'Gerson Medical', '/directory/images/default-dr-profile-1.webp', 'United Kingdom', '', 'Aesthetic clinic', 0, 0, 'Gerson Medical is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'gerson-medical');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'isobel-wood-ltd', c.id, 'Isobel Wood Ltd', '/directory/images/default-dr-profile-1.webp', 'London / Cambridge / Royston, United Kingdom', 'https://www.isobelwood.co.uk', 'Aesthetic clinic', 0, 0, 'Isobel Wood Ltd is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'isobel-wood-ltd');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'light-touch-clinic', c.id, 'Light Touch Clinic', '/directory/images/default-dr-profile-1.webp', 'Weybridge, Surrey, United Kingdom', 'http://lighttouchclinic.co.uk/', 'Aesthetic clinic', 0, 0, 'Light Touch Clinic is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'light-touch-clinic');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'plymouth', 'Plymouth', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'plymouth');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'maison-aesthetique', c.id, 'Maison Aesthetique', '/directory/images/default-dr-profile-1.webp', 'Totnes, Devon, United Kingdom', 'http://www.maisonaesthetique.co.uk/', 'Aesthetic clinic', 0, 0, 'Maison Aesthetique is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'plymouth'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'maison-aesthetique');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'manchester', 'Manchester', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'manchester');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'manchester-plastic-surgery', c.id, 'Manchester Plastic Surgery', '/directory/images/default-dr-profile-1.webp', 'Manchester, United Kingdom', 'https://www.manchesterplasticsurgery.com/', 'Aesthetic clinic', 0, 0, 'Manchester Plastic Surgery is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'manchester'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'manchester-plastic-surgery');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'pontypool', 'Pontypool', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'pontypool');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'natural-visage-aesthetics', c.id, 'Natural Visage Aesthetics', '/directory/images/default-dr-profile-1.webp', 'Pontypool, United Kingdom', 'https://naturalvisage.co.uk', 'Aesthetic clinic', 0, 0, 'Natural Visage Aesthetics is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'pontypool'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'natural-visage-aesthetics');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'np-charlotte-medical-aesthetic', c.id, 'NP Charlotte Medical & Aesthetic', '/directory/images/default-dr-profile-1.webp', 'United Kingdom', '', 'Aesthetic clinic', 0, 0, 'NP Charlotte Medical & Aesthetic is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'np-charlotte-medical-aesthetic');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'orassy-health', c.id, 'Orassy Health', '/directory/images/default-dr-profile-1.webp', 'London E14, United Kingdom', 'https://www.orassyhealth.com/', 'Aesthetic clinic', 0, 0, 'Orassy Health is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'orassy-health');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'oxford', 'Oxford', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'oxford');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'oxford-aesthetics', c.id, 'Oxford Aesthetics', '/directory/images/default-dr-profile-1.webp', 'Bicester / London / Glasgow, United Kingdom', 'https://www.oxfordaesthetics.co.uk/', 'Aesthetic clinic', 0, 0, 'Oxford Aesthetics is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'oxford'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'oxford-aesthetics');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'fareham', 'Fareham', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'fareham');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'sc-skin-aesthetics', c.id, 'SC Skin & Aesthetics', '/directory/images/default-dr-profile-1.webp', 'Fareham, United Kingdom', 'http://scaesthetics.booksy.com/', 'Aesthetic clinic', 0, 0, 'SC Skin & Aesthetics is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'fareham'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'sc-skin-aesthetics');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'nottingham', 'Nottingham', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'nottingham');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'selston-cosmetic-clinic', c.id, 'Selston Cosmetic Clinic', '/directory/images/default-dr-profile-1.webp', 'Nottinghamshire, United Kingdom', 'https://www.selstoncosmeticclinic.com/', 'Aesthetic clinic', 0, 0, 'Selston Cosmetic Clinic is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'nottingham'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'selston-cosmetic-clinic');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'sholema-aesthetics-laser-limited', c.id, 'Sholema Aesthetics & Laser Limited', '/directory/images/default-dr-profile-1.webp', 'United Kingdom', 'https://sholemaclinics.com', 'Aesthetic clinic', 0, 0, 'Sholema Aesthetics & Laser Limited is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'sholema-aesthetics-laser-limited');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'oxford', 'Oxford', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'oxford');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'skin-solutions-oxford', c.id, 'Skin Solutions Oxford', '/directory/images/default-dr-profile-1.webp', 'Abingdon / Oxford area, United Kingdom', 'https://skinsolutionsoxford.co.uk/', 'Aesthetic clinic', 0, 0, 'Skin Solutions Oxford is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'oxford'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'skin-solutions-oxford');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'tempus-intl-ltd', c.id, 'Tempus Intl Ltd', '/directory/images/default-dr-profile-1.webp', 'Belgravia, London, United Kingdom', 'https://tempusbelgravia.co.uk', 'Aesthetic clinic', 0, 0, 'Tempus Intl Ltd is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'tempus-intl-ltd');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'norwich', 'Norwich', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'norwich');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'the-academy-beauty-room', c.id, 'The Academy & Beauty Room', '/directory/images/default-dr-profile-1.webp', 'Lowestoft, United Kingdom', 'https://theacademyandbeautyroom.com/', 'Aesthetic clinic', 0, 0, 'The Academy & Beauty Room is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'norwich'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'the-academy-beauty-room');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'the-centre', c.id, 'The Centre', '/directory/images/default-dr-profile-1.webp', 'Harley Street, London, United Kingdom', 'https://londonfacialplasticsurgery.co.uk', 'Aesthetic clinic', 0, 0, 'The Centre is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'the-centre');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'the-d-souza-clinic', c.id, 'The D''Souza Clinic', '/directory/images/default-dr-profile-1.webp', 'London W1, United Kingdom', 'https://www.thedsouzaclinic.com/', 'Aesthetic clinic', 0, 0, 'The D''''Souza Clinic is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'the-d-souza-clinic');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'billericay', 'Billericay', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'billericay');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'the-face-aesthetic-skin-clinic', c.id, 'The Face – Aesthetic Skin Clinic', '/directory/images/default-dr-profile-1.webp', 'Billericay, Essex, United Kingdom', 'https://www.theface.org.uk/', 'Aesthetic clinic', 0, 0, 'The Face – Aesthetic Skin Clinic is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'billericay'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'the-face-aesthetic-skin-clinic');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'canterbury', 'Canterbury', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'canterbury');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'the-grove-clinic', c.id, 'The Grove Clinic', '/directory/images/default-dr-profile-1.webp', 'Godmersham / Canterbury area, United Kingdom', 'https://www.thegroveclinic.co.uk/', 'Aesthetic clinic', 0, 0, 'The Grove Clinic is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'canterbury'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'the-grove-clinic');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'the-medi-shed-by-dr-dil', c.id, 'The Medi-Shed by Dr Dil', '/directory/images/default-dr-profile-1.webp', 'Balham, London, United Kingdom', 'https://www.drdil.co.uk/', 'Aesthetic clinic', 0, 0, 'The Medi-Shed by Dr Dil is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'the-medi-shed-by-dr-dil');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'the-private-clinic', c.id, 'The Private Clinic', '/directory/images/default-dr-profile-1.webp', 'Harley Street, London, United Kingdom', 'https://www.theprivateclinic.co.uk/', 'Aesthetic clinic', 0, 0, 'The Private Clinic is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'the-private-clinic');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'utopian-aesthetics', c.id, 'Utopian Aesthetics', '/directory/images/default-dr-profile-1.webp', 'United Kingdom', '', 'Aesthetic clinic', 0, 0, 'Utopian Aesthetics is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'utopian-aesthetics');

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'london', 'London', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `cities` WHERE `slug` = 'london');

INSERT INTO `clinics` (`slug`, `cityId`, `name`, `image`, `gmapsAddress`, `website`, `category`, `rating`, `reviewCount`, `aboutSection`, `accreditations`, `isSaveFace`, `isDoctor`, `createdAt`, `updatedAt`)
SELECT 'yapa-plastic-surgery', c.id, 'Yapa Plastic Surgery', '/directory/images/default-dr-profile-1.webp', 'Harley Street, London, United Kingdom', 'https://yapaplasticsurgery.com/', 'Aesthetic clinic', 0, 0, 'Yapa Plastic Surgery is a Consentz customer clinic.', '["Consentz Customer"]', 0, 0, NOW(3), NOW(3)
FROM `cities` c
WHERE c.slug = 'london'
  AND NOT EXISTS (SELECT 1 FROM `clinics` WHERE `slug` = 'yapa-plastic-surgery');
