-- Seed Prestige scraped Awards/Tatler clinics (idempotent upsert)
-- Auto-applied by: docker-entrypoint.sh -> npm run db:migrate -> prisma migrate deploy
-- Clinics: 79 | Cities: 17

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('london', 'London', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('manchester', 'Manchester', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('glasgow', 'Glasgow', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('belfast', 'Belfast', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('nottingham', 'Nottingham', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('birmingham', 'Birmingham', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('newcastle', 'Newcastle', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('sandbach', 'Sandbach', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('sutton', 'Sutton', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('romsey', 'Romsey', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('greenhithe', 'Greenhithe', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('bradford', 'Bradford', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('wolverhampton', 'Wolverhampton', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('maidenhead', 'Maidenhead', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('croydon', 'Croydon', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('leeds', 'Leeds', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
VALUES ('tunbridge', 'Tunbridge', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'human-health',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Human Health',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnWiJcQnYip1L8qfYZVz4_-XCtOjHxwSa2IJvUjA3rVIhEkBRBVLXDG0NdRQcTVSzpEHOWSRKnUN9TZHtv1j1vL9fW1VAIN6YQPGZZTFU4_R4niz_DOA0WvoICRWvI1QHM-1Ns=w128-h86-k-no',
  'https://www.google.com/maps/place/Health+%26+Aesthetics+Clinic/@51.1840295,-37.6001623,4z/data=!4m10!1m2!2m1!1sHuman+Health+aesthetic+clinic+UK!3m6!1s0x48742daa82f8a7a5:0x20311c89c7d2e624!8m2!3d51.1840295!4d-0.6860998!15sCiBIdW1hbiBIZWFsdGggYWVzdGhldGljIGNsaW5pYyBVS1oiIiBodW1hbiBoZWFsdGggYWVzdGhldGljIGNsaW5pYyB1a5IBEHNraW5fY2FyZV9jbGluaWOaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMjAxUmxkdGNHWlpWVll4VkRKc1RGRlZhRkJrYkZVeVVtNUNRMVZHUlJBQuABAPoBBQikAhA9!16s%2Fg%2F1td4tr6q?entry=ttu&g_ep=EgoyMDI2MDcxMi4wIKXMDSoASAFQAw%3D%3D',
  ', Oak House, Tanshire Park, Shackleford Rd, Elstead, Godalming GU8 6LB, United Kingdom',
  NULL,
  'Aesthetic clinic',
  0,
  0,
  'Human Health is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  NULL,
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'mskin',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'manchester' LIMIT 1) AS `city_ref`),
  'mSkin',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk3CT3CrMineCel5A_Rj61ACTsnBqkcqpUIMPQHwAw7pAeJUQ1Adi4BapC8irIrPCs4NgwKteC8VCWXBRQnu9kRxGY_PHYvt4n26wt9HhyKp8DRDepka6Lkyu-xsQrS-rj952WAzFq3Tp5p=w32-h32-p-k-no',
  'https://www.google.com/maps/place/SKINS+CLINIC+-+MEDICAL+AESTHETICS/@53.4856855,-39.1645116,4z/data=!4m10!1m2!2m1!1smSkin+aesthetic+clinic+UK!3m6!1s0x487bb11175bcd429:0xa0554dccc5952edf!8m2!3d53.4856855!4d-2.2504491!15sChhTa2luIGFlc3RoZXRpYyBjbGluaWMgVUtaGiIYc2tpbiBhZXN0aGV0aWMgY2xpbmljIHVrkgEQc2tpbl9jYXJlX2NsaW5pY5oBRENpOURRVWxSUVVOdlpFTm9kSGxqUmpsdlQycG9iMUZVUW5aUk1WWXdUMFUxUW1Nd1dYZGlhMnhFWTFSc2MxUnJSUkFC4AEA-gEECDoQTA!16s%2Fg%2F11tdhyk0v3?entry=ttu&g_ep=EgoyMDI2MDcxMi4wIKXMDSoASAFQAw%3D%3D',
  'Unit 3, block 6, SKINS CLINIC, Spectrum, Blackfriars Rd, Manchester M3 7BS, United Kingdom',
  '+44 7960 860099
',
  'Aesthetic clinic',
  5,
  254,
  'Discover our natural aesthetic services for enhanced beauty and confidence. From anti-wrinkle treatments to dermal fillers, we offer bespoke rejuvenation.',
  'https://skinsclinic.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'esteem-life-medical-group',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'glasgow' LIMIT 1) AS `city_ref`),
  'Esteem Life Medical Group Glasgow',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmNLmtjEeEfCK74p_DWiYHDlVHbbFbhb0OZcDPobfz5WHbPlMgZ7j0epbw9bSIRKLWC3Oetk_3KZgj1dFzAaTX0hZiOML-BPeJB30irZCCraoPQ_AagsXGPCbkYeF3WxdAl1JWVpwtJrRY=w32-h32-p-k-no',
  'https://www.google.com/maps/place/Esteem+Life+Medical+Group+Glasgow/@55.8585724,-4.2465707,17z/data=!3m1!4b1!4m6!3m5!1s0x2927f2280a71517:0xb69fe0245d7cae15!8m2!3d55.8585724!4d-4.2465707!16s%2Fg%2F11x7hmgn_w?entry=ttu&g_ep=EgoyMDI2MDcxMi4wIKXMDSoASAFQAw%3D%3D',
  '24-26 Wilson St, Glasgow G1 1SS, United Kingdom',
  '+44 141 343 2408
',
  'Aesthetic clinic',
  4.9,
  66,
  'Experience the best in wellness and medical aesthetics at Esteem Life Medical Group, Glasgow. Transform your health today.',
  'https://www.esteemlife.co.uk/',
  'admin@esteemlife.co.uk',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'south-william-clinic-group',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'South William Clinic Group',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk1rKyH2ME29z2ROP1D_hCljOLjyqL4oVbtWAB_yXDbPpOlnjO8AD8zWhDaUVFSZhljNxV_2QvxMDNuLsgpPAaDHt8JUPMhliaRiqoBALBmodyPl35gzbNpQQawd28Q34V_w_sG=w32-h32-p-k-no',
  'https://www.google.com/maps/place/Dr+SW+Clinics/@51.9393956,-3.2073119,7z/data=!3m1!5s0x48761ad3e4ab7d17:0x4f77c6aff1ce976c!4m10!1m2!2m1!1sSouth+William+Clinic+Group+aesthetic+clinic+UK!3m6!1s0x48761ad3e4ac69b5:0x8943ef774b03be2a!8m2!3d51.519817!4d-0.147625!15sCi5Tb3V0aCBXaWxsaWFtIENsaW5pYyBHcm91cCBhZXN0aGV0aWMgY2xpbmljIFVLWjAiLnNvdXRoIHdpbGxpYW0gY2xpbmljIGdyb3VwIGFlc3RoZXRpYyBjbGluaWMgdWuSARZwbGFzdGljX3N1cmdlcnlfY2xpbmljmgEkQ2hkRFNVaE5NRzluUzBWSlEwRm5UVU5KTUdSRFFYZFJSUkFC4AEA-gEECCgQRQ!16s%2Fg%2F11byclqgmp?entry=ttu&g_ep=EgoyMDI2MDcxMi4wIKXMDSoASAFQAw%3D%3D',
  '77 Harley St, London W1G 8QN, United Kingdom',
  '+44 20 3006 8459
',
  'Aesthetic clinic',
  4.4,
  142,
  'Dr SW Clinics offers you the most effective non-surgical and surgical aesthetic medicine, and revolutionary Sexual Rejuvenation Treatments on Harley Street.',
  'http://www.drswclinics.com/',
  'info@drswclinics.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'array-aesthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'belfast' LIMIT 1) AS `city_ref`),
  'Array Aesthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlUg2lJADEd6hg7wGUHfhf31ty6jG0uSMZtdKgM2Dr3LdPIvwRB099UoxWC4RoesmQCIkZ2-ZXcY4LCMmtmjmgbKfWQxbCB8_Y1bvZQUjT1Khg2y7xL-bMSMbE-nHyRpdoawmpL=w32-h32-p-k-no',
  'https://www.google.com/maps/place/Array+Aesthetics+Belfast+%7C+Doctor-led+Clinic/@54.5732323,-5.963631,17z/data=!4m10!1m2!2m1!1sArray+Aesthetics+aesthetic+clinic+UK!3m6!1s0x48610857db67828f:0x731547719b1a5783!8m2!3d54.5732323!4d-5.9591249!15sCiRBcnJheSBBZXN0aGV0aWNzIGFlc3RoZXRpYyBjbGluaWMgVUtaJiIkYXJyYXkgYWVzdGhldGljcyBhZXN0aGV0aWMgY2xpbmljIHVrkgEQc2tpbl9jYXJlX2NsaW5pY5oBRENpOURRVWxSUVVOdlpFTm9kSGxqUmpsdlQyMW9RMkpVVWtWVFV6Rk9WbnBLTTA1SGJGbFZXR3haWWpCa2NsSnRZeEFC4AEA-gEFCKkHEEA!16s%2Fg%2F11b7kg8l90?entry=ttu&g_ep=EgoyMDI2MDcxMi4wIKXMDSoASAFQAw%3D%3D',
  '665 Lisburn Rd, Belfast BT9 7GT, United Kingdom',
  '+44 28 9457 1840
',
  'Aesthetic clinic',
  4.9,
  248,
  'Botox & Dermal Filler Belfast. Doctor led clinic aesthetics clinic providing advanced skin treatments in Botox, dermal fillers, Eyelid Surgery, FaceTite & Varicose Vein Treatment. Delivering natural results and the gold standard in patient care. Book a consultation online.',
  'https://www.arrayaesthetics.com/',
  'enquiries@arrayaesthetics.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'london-professional-aesthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'London Professional Aesthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnxHRpo5_Ymj1Qhe2LPJ6d_g2XfwILl-JIRBmBZ2zTm8EJ8XbC83KrwhrN8H6mKni8TDiojVEzPcZFTpVoHYUQ3VRd1aDB5MBgOTxz2-MrlPGodbyJHcj68zOjI6ZudYnELVDP3=w32-h32-p-k-no',
  'https://www.google.com/maps/search/London%20Professional%20Aesthetics%20aesthetic%20clinic%20UK',
  '193 Whitecross St, London EC1Y 8QP, United Kingdom',
  '+44 20 4572 3335
',
  'Aesthetic clinic',
  4.9,
  145,
  'Trusted skin clinic in Islington, London for Botox, dermal fillers & advanced skin boosters. Est. 2010 near Barbican & Old Street. Book online today.',
  'https://lpa.london/?utm_source=google&utm_medium=organic&utm_campaign=googlemybusiness',
  'HELLO@LPA.LONDON',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'your-beauty-doctor',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'nottingham' LIMIT 1) AS `city_ref`),
  'Your Beauty Doctor',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkZc_lMZx8Xc6UMfnwuRMzrJXrtfjY3350-sL4VuX5IG4J396U8RVBKgFRW9eeZzrIwaLPwMUKugCn9XYiHtpYbfgRQeeAMXHrSdNN4wBgJil_Uw_4LTAT9TKcpOEy-aiJkaJbU=w32-h32-p-k-no',
  'https://www.google.com/maps/search/Your%20Beauty%20Doctor%20aesthetic%20clinic%20UK',
  '65 Melbury Rd, Mapperley, Woodthorpe, Nottingham NG5 4PF, United Kingdom',
  '+44 115 795 3453
',
  'Aesthetic clinic',
  4.9,
  202,
  'A leading Aesthetics Doctor, specialising in natural results. With clinics in both London and Nottingham you will find the very best treatments on offer from both myself and my team. We are honoured to be the only clinic in Nottinghamshire able to offer the latest ground-breaking ultrasound skin treatment, Sofwave.',
  'http://www.yourbeautydoctor.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'medizen-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'birmingham' LIMIT 1) AS `city_ref`),
  'MediZen Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkmWQiWVeZh-S-f8E9jeBkksQld7DBx6VExuNx9P9TKx18lBxCrRNJOSSPYVWIohBZnhIZSz8yZgqe28sakggN47GpToP_6LE-TSlTr7YlnbixBzw1idFSCIBr1xopMFVJfhbko=w32-h32-p-k-no',
  'https://www.google.com/maps/place/Th%C3%A9rapie+Clinic+-+Birmingham+City+Centre/@52.479005,-6.5136358,7z/data=!3m1!5s0x4870bc8956bd7677:0x227435bd4e1b1271!4m9!1m2!2m1!1sMediZen+Clinic+aesthetic+clinic+UK!3m5!1s0x4870bda7ec7d746d:0x678ed8cd701280e1!8m2!3d52.4790051!4d-1.8993783!16s%2Fg%2F11ybz8z8gx?entry=ttu&g_ep=EgoyMDI2MDcxMi4wIKXMDSoASAFQAw%3D%3D',
  'Lower Temple St, Birmingham B2 4JD, United Kingdom',
  '+44 20 8114 0311
',
  'Aesthetic clinic',
  4.8,
  542,
  'Visit Thérapie Clinic Birmingham for laser hair removal, anti-wrinkle injections, lip fillers and skin treatments. Book your free consultation.',
  'https://therapieclinic.com/locations/birmingham-city-centre?utm_source=google&utm_medium=organic&utm_campaign=gmb&utm_content=birmingham-city-centre',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'paragon-aesthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'newcastle' LIMIT 1) AS `city_ref`),
  'Paragon Aesthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlxRZXGtNTPmkmkPGCDEx6Y8aX18F7yTM5HNcBpng7aSboibqzAcf5Vqz4D5T1KEsAsfyBnxMxynXYVjhrDjUX6zEKi8cBeiS3nkifciGgyRB5L1zFIwY9MQjjSIaabCijaScI=w648-h240-k-no',
  'https://www.google.com/maps/place/Paragon/@55.0413953,-1.4470333,17z/data=!3m1!4b1!4m6!3m5!1s0x487e70dc0f6ebf71:0x7fb612f41b53177e!8m2!3d55.0413953!4d-1.4470333!16s%2Fg%2F11cs24df7h?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
  '3B Marden Rd, Newcastle NE26 2JH, United Kingdom',
  '+44 7454 113862
',
  'Aesthetic clinic',
  0,
  0,
  'We''re a leading Newcastle based medical aesthetics clinic, providing dermal, lip fillers, polyneucleotides, RF microneedling, scar treatment.',
  'https://paragonaesthetics.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'dr-medispa',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Dr MediSpa',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl3EwsE3RM65pseKBWi0vJVhYlFwygOr1el_rfpTVZmh6ocpJ7C_TehLoYWDe6kxPNJRsUtwCe-IBowyNVMEdDy_vv_nr-U8bl6_8YNwK8hA8U2g7LU_GPVwKjh_yKANfql_IsW6g=w32-h32-p-k-no',
  'https://www.google.com/maps/place/DrMediSpa/@51.5201689,-4.7699127,7z/data=!4m10!1m2!2m1!1sDr+MediSpa+aesthetic+clinic+UK!3m6!1s0x48761b1a34581cf3:0x9464856ad2b032d5!8m2!3d51.5201689!4d-0.1556549!15sCh5EciBNZWRpU3BhIGFlc3RoZXRpYyBjbGluaWMgVUtaICIeZHIgbWVkaXNwYSBhZXN0aGV0aWMgY2xpbmljIHVrkgEQc2tpbl9jYXJlX2NsaW5pY5oBI0NoWkRTVWhOTUc5blMwVkpRMEZuU1VOYWMxbFhhVWxCRUFF4AEA-gEECHQQTA!16s%2Fg%2F11h2c9_9bd?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
  '59 Chiltern St, London W1U 6NF, United Kingdom',
  '+44 20 8418 0362
',
  'Aesthetic clinic',
  4.8,
  217,
  'Achieve natural-looking results with our expert aesthetic treatments. Specialist Botox, dermal fillers, laser treatments and skincare from experienced medical practitioners.',
  'http://www.drmedispa.com/',
  'hello@drmedispa.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'kast-aesthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'sandbach' LIMIT 1) AS `city_ref`),
  'KAST Aesthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl_jGdPz24CA3H58Gk9-frr0WfArVyHMstDu9twX8_DRy7Py0gGj9JyAtCHcO_wrkI_n-NnkA8RE0s0xx_XOevBZzpjMp9JnxjqM2o90debgDDTtkqmavR7ZHDPXuS_HtA99P0RFw=w32-h32-p-k-no',
  NULL,
  'Floor 1, 2 Bradwall Rd, Sandbach CW11 1GB, United Kingdom',
  '+44 1270 762330
',
  'Aesthetic clinic',
  5,
  217,
  'KAST Aesthetics is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'https://www.kastaesthetics.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'berkeley-hair-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Berkeley Hair Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmQTtPPjSjUEN4UauLatPMWbylqVcf_SJPG1W_C0UL23eYv-2qF4JRMgYKbcP7D5W-UFSwxJlwdzVIu7csi17tVNZTEZP8i8SWDZ9DrZ2gTAA4ILQvx0RQxE4a2oQhkv-L4UJCUzGUX9_cO=w32-h32-p-k-no',
  'https://www.google.com/maps/place/Harley+Street+Medics/@52.6615954,-3.0826255,7z/data=!4m9!1m2!2m1!1sBerkeley+Hair+Clinic+aesthetic+clinic+UK!3m5!1s0x48761b0b8241008f:0x81b5e10acd58ba8d!8m2!3d51.5209652!4d-0.1119093!16s%2Fg%2F11lmnrgz_f?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
  ', 1-5 Portpool Ln, London EC1N 7UU, United Kingdom',
  NULL,
  'Aesthetic clinic',
  4.6,
  202,
  'Berkeley Hair Clinic is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  NULL,
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'amer-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Amer Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWn3DwG5-ZvBUjp6_WqwfmqK6Qm6Ai10mmbQFQnf7WAbElOd5BHnw4wv3sGtOMDfYBiyZBIscukt5Z_1XLbdFnmdf6AzewtLw4VhHJnNtXLhGXZc1YvphV4Qfu-8pET_cXF51XM8=w32-h32-p-k-no',
  'https://www.google.com/maps/place/Amer+Clinic/@51.5029403,-37.1058303,4z/data=!4m10!1m2!2m1!1sAmer+Clinic+aesthetic+clinic+UK!3m6!1s0x48760ff712e9c51d:0x3efa85d0779f727e!8m2!3d51.5029403!4d-0.1917678!15sCh9BbWVyIENsaW5pYyBhZXN0aGV0aWMgY2xpbmljIFVLWiEiH2FtZXIgY2xpbmljIGFlc3RoZXRpYyBjbGluaWMgdWuSARBza2luX2NhcmVfY2xpbmljmgFEQ2k5RFFVbFJRVU52WkVOb2RIbGpSamx2VDIwNE0ySnFSbHBTVjA1V1lteEtWRk51YkhoUFNHZ3dXa2haTTFSdVl4QULgAQD6AQQIRBAx!16s%2Fg%2F11wwsjq3_w?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
  '13 Kensington Church St, London W8 4LF, United Kingdom',
  '+44 20 8050 8830
',
  'Aesthetic clinic',
  4.8,
  85,
  'Welcome to Amer Clinic, a private medical aesthetics clinic in Kensington, London. Led by Dr Priyanka Chadha, FRCS. Book your consultation today.',
  'https://www.amerclinic.com/',
  'patients@amerclinic.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'the-ghanem-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'The Ghanem Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWm39RW_BYPo7rH8JWwaYJIQTA9LjK7CaCr8IQdHPK0w2bemOGi-eVB61zeYgApdog26u_RtYasgRtGZP0fnl40XWZc3JXgPni7Js49UsB4iRORnMsN_30oRAmHpuBaC4fHi18eM77ht65Zm=w32-h32-p-k-no',
  'https://www.google.com/maps/search/The%20Ghanem%20Clinic%20aesthetic%20clinic%20UK',
  '4 Upper Wimpole St, London W1G 6LF, United Kingdom',
  '+44 20 3750 0400
',
  'Aesthetic clinic',
  4.8,
  101,
  'The Ghanem Clinic is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'http://www.theghanemclinic.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'hhc-clinics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'nottingham' LIMIT 1) AS `city_ref`),
  'HHC Clinics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmYYu1EokzIYHSnJaCgoVBjG57P1EvtiO-qO7QlEkrqcimUNsQ0TbGGM1SENxzY8Xdaa0Oyq4k4yznVIQaUF_zaKBHjDRwm-3T5x8i7RFAJRe89VYBwRYbZ3v8Alpk3fjaTruS4xQ=w32-h32-p-k-no',
  'https://www.google.com/maps/place/HHC+Clinics/@52.932097,-3.5688139,8z/data=!4m10!1m2!2m1!1sHHC+Clinics+aesthetic+clinic+UK!3m6!1s0x4879e972add9dac5:0x35ae0bf42a8f0d0!8m2!3d52.932097!4d-1.261685!15sCh9ISEMgQ2xpbmljcyBhZXN0aGV0aWMgY2xpbmljIFVLWiEiH2hoYyBjbGluaWNzIGFlc3RoZXRpYyBjbGluaWMgdWuSAQ1tZWRpY2FsX2dyb3VwmgEkQ2hkRFNVaE5NRzluUzBWSlEwRm5TVU5JZUVwVWVuZDNSUkFC4AEA-gEECGQQNQ!16s%2Fg%2F11gbk47_hr?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
  '162 Nottingham Rd, Stapleford, Nottingham NG9 8AR, United Kingdom',
  '+44 115 897 6696
',
  'Aesthetic clinic',
  4.7,
  151,
  'Top experienced surgeons specialising in fue, male, female, transgender & Afro-Caribbean hair restoration. Voted outstanding by the CQC.',
  'https://www.hhclinics.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'medizen',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'sutton' LIMIT 1) AS `city_ref`),
  'MediZen Premier Aesthetic Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkXI6gkGHd1TYECQqi8GhDTXcjzgjNVTeB1rz0wDJgQSF_tpvfDy10uQ4eD_jZ-OhmMozLXlnDojvDaLR5ItM8L3aUWPIvWlRuVv6pqGYuID61bfgtmi878hzfRIu3TT-KiS9I=w32-h32-p-k-no',
  'https://www.google.com/maps/search/MediZen%20aesthetic%20clinic%20UK',
  'Ste A, astor house, 282 Lichfield Rd, Mere Green, Birmingham, Sutton Coldfield B74 2UG, United Kingdom',
  '+44 121 308 4373
',
  'Aesthetic clinic',
  4.7,
  193,
  'Best Clinic Midlands & Wales 2023! Transform your confidence at our Medical Aesthetic Clinic in Birmingham. Explore advanced treatments for a radiant, rejuvenated you.',
  'http://www.medizen.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'estheva',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'glasgow' LIMIT 1) AS `city_ref`),
  'Estheva',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmCW8CCyXt9tI4LGGLp5lKAbYBEpUaWrAOdhpa5ZGC97UZb_JBm4mTpKbOR6RM459dGrHKd43nMf12O4VQxfl-Uh-gVnYINSnRBqaoJqb55J396MGnFbaUhEVVB7wGdgQrjx5iO9_kRWr_4=w32-h32-p-k-no',
  'https://www.google.com/maps/place/Space+NK+Glasgow/@55.859179,-41.1680545,4z/data=!3m1!5s0x4888469f94fb5077:0x529e9ba53b1cc36a!4m9!1m2!2m1!1sEstheva+aesthetic+clinic+UK!3m5!1s0x4888469f0db7d915:0xb3b8826191101c86!8m2!3d55.8591791!4d-4.253992!16s%2Fg%2F1w0q_hb6?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
  '48, Princes Square, 36-38 Buchanan St, Glasgow G1 3BZ, United Kingdom',
  '0141 248 7931
',
  'Aesthetic clinic',
  3.6,
  133,
  'Our accredited nurse practitioners at Estheva Medical Aesthetic clinic help you to achieve natural results using proven aesthetic treatments and techniques',
  'https://estheva.co.uk/',
  'info@estheva.co.uk',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'est-ethics-wellness-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'glasgow' LIMIT 1) AS `city_ref`),
  'Est-Ethics Wellness Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlOYp75MMuZBVPkmLfg_QlpD4YDSoNt_VDWKnmLdPzZ2-myPzp6GnXFQAWoNxBRVbacINv1UeAEnzjmXftc5v3nfN_syfNlRqq01qGpQO3CAr7vP9B75qshopzSPwlEegqoJ2RM=w408-h240-k-no-pi-20-ya8.599999-ro-0-fo100',
  'https://www.google.com/maps/search/Est-Ethics%20Wellness%20Clinic%20aesthetic%20clinic%20UK',
  '170 Ingram Street, Unit 6, Italian Center, Glasgow G1 1DN, United Kingdom',
  NULL,
  'Aesthetic clinic',
  0,
  0,
  'Est-Ethics Wellness Clinic is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'http://www.est-ethics.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'the-london-regenerative-institute',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'The London Regenerative Institute',
  'https://london-regenerative.com/wp-content/uploads/2024/03/LongevityScreening-1-446x503.jpg',
  NULL,
  ', 152 Harley St, London W1G 7LH, United Kingdom',
  '07908 422412
',
  'Aesthetic clinic',
  4.9,
  76,
  'London Regenerative Institute (LRI) stands at the forefront of longevity and regenerative treatments through cutting-edge, personalised protocols. LRI offers a 360 degree approach to your health, unlocking the key to a healthier life.',
  'https://london-regenerative.com/?utm_source=google&utm_medium=organic&utm_campaign=gmb',
  'info@london-regenerative.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'dr-eithne-brenner-aesthetic-medicine',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Dr Eithne Brenner Aesthetic Medicine Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlJUbjFXMOMOd7-upvSzqsCBP6nlp_7eHzJo89kzRwhpRVGvt2JOTRhhcLkG9D8eesuhEvDPgDuNbo6inwhrCYeL89Sb1ZIsHRXbZ0w007bFqPlobXTcFWt5xJl5ko3Z5V7KR3g=w408-h544-k-no',
  'https://www.google.com/maps/search/Dr%20Eithne%20Brenner%20Aesthetic%20Medicine%20aesthetic%20clinic%20UK',
  'Office E, Citywest Shopping Centre, Citywest, Dublin, D24 FW22, Ireland',
  '01 9602277

',
  'Aesthetic clinic',
  4.8,
  55,
  '| Dr Eithne Brenner',
  'https://www.dreithnebrenner.ie/',
  'info@dreithnebrenner.ie',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'facetherapy-ni',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'belfast' LIMIT 1) AS `city_ref`),
  'FaceTherapy NI',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnIWQiKeyRIwgnq8PasdeFntLi3gw5-mEQNvMF6phplUI1J4bpiXFfb23HDOYDIZwHXb-c_zDS5RYJ9k2h8yMF8jM6lRY6Sm_-5GFuFmXPYjp-mYEvc02F06YecOS0aAZyluj8=w408-h544-k-no',
  'https://www.google.com/maps/search/FaceTherapy%20NI%20aesthetic%20clinic%20UK',
  '545 Antrim Rd, Belfast BT15 3BU, United Kingdom',
  '+44 28 9039 1726
',
  'Aesthetic clinic',
  5,
  95,
  'Botox & Dermal Filler Belfast',
  'https://facetherapyni.com/',
  'enquiry@facetherapyni.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drs-tatiana-rishi-advanced-aesthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Drs Tatiana + Rishi Advanced Aesthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkM4aoRtxw1ZaWr5021yZpVDdeR2lZE6VRIHTEEAYuCokTvjLp7S07W7yxaGQI-T0xJShMj0W9SL2H5rZemGR8fJ9w1yCsIyJJVa9UAOPBAx7cSXC0g77PHAW8PhryXC4Q0jkDQIw=w408-h612-k-no',
  NULL,
  'Drs Tatiana + Rishi Advanced Aesthetics, 2 Devonshire Pl, London W1G 6HJ, United Kingdom',
  '+44 7718 219145
',
  'Aesthetic clinic',
  4.8,
  300,
  'Long-established medical aesthetics clinic in London led by leading experts in the field. Registered with the CQC. Learn more',
  'https://www.drtatiana.co.uk/?utm_source=Google&utm_medium=Organic&utm_campaign=GBP-listing',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'phi-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'PHI Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWku5Ln0ievdv_IUWJWM0tVh9rX3cIBZj4ZXC_TP8gHJBmDtFJLW4ZK-sZKDFo9zyqGLFwMVfQcGHzIt_NIwg5a1gMiDzx9RjydjA2SaLTAAu09Sa7RZnhs8S8sQ9UJAsxOCTPbCq18sxcI=w408-h272-k-no',
  'https://www.google.com/maps/search/PHI%20Clinic%20aesthetic%20clinic%20UK',
  '102 Harley St, London W1G 7JB, United Kingdom',
  '+44 20 7034 5999
',
  'Aesthetic clinic',
  4.8,
  302,
  'Doctor-led aesthetic clinic on Harley Street. Botox, dermal fillers, Profhilo, laser and regenerative treatments for natural, considered results.',
  'https://www.phiclinic.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'medizen-aesthetic-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'sutton' LIMIT 1) AS `city_ref`),
  'MediZen Aesthetic Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkXI6gkGHd1TYECQqi8GhDTXcjzgjNVTeB1rz0wDJgQSF_tpvfDy10uQ4eD_jZ-OhmMozLXlnDojvDaLR5ItM8L3aUWPIvWlRuVv6pqGYuID61bfgtmi878hzfRIu3TT-KiS9I=w138-h92-k-no',
  NULL,
  ', Ste A, astor house, 282 Lichfield Rd, Mere Green, Birmingham, Sutton Coldfield B74 2UG, United Kingdom',
  NULL,
  'Aesthetic clinic',
  4.7,
  193,
  'MediZen Aesthetic Clinic is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  NULL,
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'precise-medical-aesthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'glasgow' LIMIT 1) AS `city_ref`),
  'Precise Medical Aesthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk9BFYxk97r3Grth56nOc01ANx4_F-xCdweycAlPDzKrL5BDVUfsJ9i-Oqa-egps9wt3PANEuTk_b8UNN2LmL_Yfs4dOvjswaiwJuuHC8_hu8ZBe9yk2UMz264HPObbZjHuLPszMVFkOrvT=w80-h92-p-k-no',
  NULL,
  ', 48, Princes Square, 36-38 Buchanan St, Glasgow G1 3BZ, United Kingdom',
  NULL,
  'Aesthetic clinic',
  3.6,
  133,
  'Precise Medical Aesthetics is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  NULL,
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'romsey-medical-practice',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'romsey' LIMIT 1) AS `city_ref`),
  'Romsey Medical Practice',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmBSPSrGbwJCHzHos-5pMwXUY9VIIrQGGIBT-v-kSyroQyQHtF49ZxpedintlBLlap2TN3y0zyjLKf5VTVZM7i14aRPI9U3eq70fCY22WYmNT0QQv_7VwEpPDn8UFlTMOag7GxY=w408-h408-k-no',
  'https://www.google.com/maps/search/Romsey%20Medical%20Practice%20aesthetic%20clinic%20UK',
  '4, Broadwater Rd, Romsey SO51 8JJ, United Kingdom',
  '+44 1794 278110
',
  'Aesthetic clinic',
  5,
  306,
  'Romsey Medical Practice. Dr Chris and Nurse Emily welcome you to Romsey Medical Practice. We''re proud to offer a range of Medical Services such as; Private GP, Dermatology, Gynaecology and Cosmetic Services.',
  'http://www.romseymedicalpractice.co.uk/',
  'info@romseymedicalpractice.co.uk',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'elite-aesthetic-clinic-ltd',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'greenhithe' LIMIT 1) AS `city_ref`),
  'Elite Aesthetic Clinic Ltd',
  'https://www.elite-aesthetics.co.uk/wp-content/uploads/2022/10/PDO-threading-Peyronies-disease-UK-Treatment-Lichen-Sclerosus-Kent-BOTOX®-anti-wrinkle-injections-dermal-fillers-Private-clinic-ELITE-aesthetics-logo.jpg',
  NULL,
  ', Grove House, 32, Greenhithe DA9 9XN, United Kingdom',
  '+44 1322 381205
',
  'Aesthetic clinic',
  4.9,
  433,
  'P Shot, Lichen Sclerosus & Vampire Breast Lift by Dr Shirin Lakhani. Near London. Book a confidential consultation.',
  'https://www.elite-aesthetics.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'pico-london',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'PICO London',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmbnfe_AFlxD4dZ7c5hj6eR0z-RSGbjpwb7fNgsewQggEOmqH4QpMS1I50BS7jcMo5VgMiKWdPLYKBrEgCsPG_XFKVPBl5tbYCviTQ1eszoGqniI47n6jdNGx6W7oCQ0WPYhEG35g=w426-h240-k-no',
  'https://www.google.com/maps/search/PICO%20London%20aesthetic%20clinic%20UK',
  'Cameo House, 11 Bear St, London WC2H 7AS, United Kingdom',
  '+44 7555 739379
',
  'Aesthetic clinic',
  5,
  103,
  'PICO is a global provider of premium aesthetic medical treatments with clinics in London, New York, Milan, Shanghai, Beijing and Hangzhou.',
  'https://www.picoclinics.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'london-aesthetic-medicine',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'London Aesthetic Medicine',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkP6Ezi0ZAW7cytZIo7jEzAMOliNhozG2AJKb_MY6P5VZU55eE_Qo13Nz-QtswrvDeN2DkI_dKgWrm2kO8KjuB3wMj69_W4_i6IoQRIhMEU4oWF44UZQtypnE1JEoUamuYTFsqB=w150-h92-k-no',
  'https://www.google.com/maps/search/London%20Aesthetic%20Medicine%20https%3A%2F%2Flondon-aesthetic-medicine.com%20UK',
  ', 4 Harley St, London W1G 9PB, United Kingdom',
  NULL,
  'Aesthetic clinic',
  4.8,
  73,
  'London Aesthetic Medicine is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'https://london-aesthetic-medicine.com',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'air-aesthetics-and-wellness-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Air Aesthetics & Wellness Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnF6YNbWoohBWp9xdJlQlMFOwieyO-nW5avqkHfmpuwqOzQnXpC0G7NGiARNkOhwjhAIsWknCt38CR1kTOSs2meFVRBMkTq6kHddfq7qFhJ7Ixk9oBuPB9ifO3i1al8I51Z-5ZbTg=w138-h92-k-no',
  NULL,
  'London, United Kingdom',
  NULL,
  'Aesthetic clinic',
  4.9,
  28,
  'Air Aesthetics & Wellness Clinic is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  NULL,
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'myskyn-clinic-ltd',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'bradford' LIMIT 1) AS `city_ref`),
  'MySkyn Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmdCLERgovj5vhwzzRd0Iwi18JQhYzkn1nxP5GDbjwsRwxokndoZiiOOYFzQHXXwQ1moiSUSGFSEVdkKjwjTkC6L0Xs5SPybWu_lyNW21d7kOmZ-xZZOvdXLPH0i3-xUuQPCjo=w408-h272-k-no',
  'https://www.google.com/maps/search/MySkyn%20Clinic%20Ltd%20aesthetic%20clinic%20UK',
  'Lower Ground Floor Allerton Health Centre, Bell Dean Rd, Bradford BD15 7WA, United Kingdom',
  '+44 1274 921121
',
  'Aesthetic clinic',
  4.9,
  114,
  'Leading skin & aesthetics clinic Bradford. Doctor-led treatments with high standards - CQC rated ''good''. Book your consultation today.',
  'https://myskyn.co.uk/?utm_source=Google&utm_medium=Organic&utm_campaign=GBP-listing',
  'enquiries@myskyn.co.uk',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'trikwan-aesthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Trikwan Aesthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnY4VC9HMljUl5bDkCMPfbvSd-ePb0Qp0Uhp7-iKTn79Q4JOfZ5ANqxHgUcm7BE5yJieaxPaQZrTROovNyy4EKHd_KPEL--FOw3B7sInxaIhO-fW11ekiLjhsOOwtEHB5sZ-0-R=w408-h272-k-no',
  'https://www.google.com/maps/search/Trikwan%20Aesthetics%20aesthetic%20clinic%20UK',
  '61 S Molton St, London W1K 5SN, United Kingdom',
  '+44 7305 058349
',
  'Aesthetic clinic',
  4.9,
  233,
  'Trikwan Aesthetics’ story has grown from a dream of two medical students to a doctor-led, aesthetics sanctuary in the heart of Mayfair.',
  'http://trikwan.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'elite-aesthetic-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'greenhithe' LIMIT 1) AS `city_ref`),
  'Elite Aesthetic Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWksO8OdkR_gwiHg4DuTVdz9pl7hxjozm8XkSQnbHcnGbJy7xBBvsP7WSSPqvPJjihv1SFkywMy9b3qoZlv8UJPoAMxYLUuMN9BWUoA5sZvkmjg0H168vZqMWWmJWzugv_CY-lj8Ag=w122-h92-k-no',
  NULL,
  ', Grove House, 32, Greenhithe DA9 9XN, United Kingdom',
  NULL,
  'Aesthetic clinic',
  4.9,
  433,
  'Elite Aesthetic Clinic is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  NULL,
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'taktouk-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Taktouk Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl17snmoHnZsRA49xVFCHdCeRHNz_Yf8XlHiNeDPvg3Bftj8iRZWJVdUrL95S1wgn459uWUKpwhFejEUXddRkxr6vyEXPEK3PB8i5WPQL2aLp8LC8hFVWgNm6yja42EICJ26b-8lw=w426-h240-k-no',
  'https://www.google.com/maps/search/Taktouk%20Clinic%20aesthetic%20clinic%20UK',
  '56, Knightsbridge Court, 12 Sloane St, London SW1X 9LJ, United Kingdom',
  '+44 20 7235 7198
',
  'Aesthetic clinic',
  4.9,
  173,
  'Taktouk Clinic is the Aesthetic Medical and Laser Dermatology Clinic of Dr Wassim Taktouk in Knightsbridge, London.  The clinic offers injectables, dermal fillers, CO2 and laser skin resurfacing, thread lifts and PRP.',
  'http://www.drwassimtaktouk.com/',
  'info@drwassimtaktouk.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'the-clinic-by-dr-maryam-zamani',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'The Clinic by Dr Maryam Zamani',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmR674JrKzjewAj0uREdWE06TusTeaTAW9yEyBJ-8M1TAOLlCLVMC38EMSgSQaUeIdT99HsartXmRVuyx2lG_X24upBo_1ssn0k4qOJWg_fUfUoEmAlI9TZ5vSz-sTFK8IrBd9F=w408-h538-k-no',
  'https://www.google.com/maps/search/The%20Clinic%20by%20Dr%20Maryam%20Zamani%20aesthetic%20clinic%20UK',
  '110-112 King''s Rd, London SW3 4TX, United Kingdom',
  '+44 20 3955 9700
',
  'Aesthetic clinic',
  4.7,
  227,
  'Transform tired-looking eyes with expert blepharoplasty. Dr Maryam Zamani offers personalized eyelid surgery at her award-winning London clinic. Book your consultation today.',
  'http://www.drmaryamzamani.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'beechwood-house-healthcare',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'wolverhampton' LIMIT 1) AS `city_ref`),
  'Beechwood House Healthcare',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlYZkqIl493tiCi2yiRYf07_MUFdmd8WT5w_iMfhGHSCtjQwM5QVvSsNcbGta7HtTNcGtGBp0y4A3oMopwdurIQLu-RcVmU19UOfX44tf1Ti0xiKw_QxqUFV63BQ3sgMhyZUpyJWzFekK2v=w519-h240-k-no',
  'https://www.google.com/maps/search/Beechwood%20House%20Healthcare%20aesthetic%20clinic%20UK',
  '7 Summerfield Rd, Wolverhampton WV1 4PR, United Kingdom',
  '+44 800 999 1748
',
  'Aesthetic clinic',
  4.5,
  24,
  'Private GP, dermatology and minor operations in Wolverhampton. Calm, expert care with a clear, personalised quote after assessment — serving Wolverhampton and the wider West Midlands.',
  'http://www.beechwoodhousehealthcare.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'eden-medical-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'belfast' LIMIT 1) AS `city_ref`),
  'Eden Medical Clinic',
  'https://eden-medicalclinic.com/wp-content/uploads/2019/04/Eden-Medical-Clinic-Cork.jpg',
  NULL,
  ', 257 Lisburn Rd, Belfast BT9 7EN, United Kingdom',
  '028 9600 5408
',
  'Aesthetic clinic',
  5,
  32,
  'Eden Medical Clinic delivers the highest standard of aesthetics. Cork | Kerry | Limerick | Waterford | Dublin | Kilkenny | Galway | Drogheda',
  'https://eden-medicalclinic.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'the-new-you-clinic',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'The New You Clinic',
  NULL,
  NULL,
  'London, United Kingdom',
  '+44 7771 361473
',
  'Aesthetic clinic',
  4.9,
  57,
  'Personalised enhancement for aesthetic harmony. Rhinoplasty, breast surgery, liposuction, and more. Perfectly balanced results with your face and body.',
  'https://newyouharleystreet.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'facetherapyni',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'belfast' LIMIT 1) AS `city_ref`),
  'Facetherapyni',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkHbM3IqvwayN0itda3Zi_s2MIx8wCSO-68ecxvnN_TbT357OQe0NpzZw13e5Z1uZkT4fzF4UHmBkj795WK0IRr3hdNUCTZLkd1L94SiVSA1_x2bPmEyu8p5BQZ57Crt9gzZplZgYP6imzj=w32-h32-p-k-no',
  'https://www.google.com/maps/search/FaceTherapyNI%20aesthetic%20clinic%20UK',
  ', 257 Lisburn Rd, Belfast BT9 7EN, United Kingdom',
  '028 9600 5408
',
  'Aesthetic clinic',
  5,
  32,
  'Botox & Dermal Filler Belfast',
  'https://facetherapyni.com/',
  'enquiry@facetherapyni.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'juve-medical-and-aesthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Juve Medical and Aesthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmi5ZieN8VTuAawg6FbH1RXCn0fm2HVe3Zh8P-sao4ZYnwEw3XDKFXZzBgwPym41TGZKvTR4IBpcjOr0J76r_Y4gTz61v5SkIml0TWP5s-APysCbfR9cLQm832KuTe_GD9-cDs=w91-h92-k-no',
  NULL,
  'London, United Kingdom',
  NULL,
  'Aesthetic clinic',
  5,
  7,
  'Juve Medical and Aesthetics is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  NULL,
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  '23md',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  '23MD',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl0MepsroxC2-RYsfiv850d398uQ6loF5u9rBEwqj3daoIQVyX7TLIIkSc3siDr1au7nEvc0RGuc1LneSisFs6exvaj0koG-p3c1raLqi_g2hDHNWjRLaL_MZ2OPiBzlQVt6NRJ=w408-h544-k-no',
  'https://www.google.com/maps/search/23md%20https%3A%2F%2F23md.co.uk%20UK',
  '23 Elystan St, London SW3 3NT, United Kingdom',
  '+44 20 7078 0302
',
  'Aesthetic clinic',
  4.2,
  32,
  'Discover 23MD Home in London and Dubai, a leading cosmetic and medical clinic in Dubai and London. Specialising in bioidentical hormone replacement therapy (BHRT), anti-aging, and advanced aesthetic treatments, we provide personalised, medically-proven care in a comfortable, private setting',
  'https://23md.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'aestheticplasticsurgeons',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Aestique Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlBugbAkHUo0vwXlvKv3TgNHSfARMC7Lr_SVGFSehqipZ8MN5RSDBa9TmskG1KmnAu0LMNW-qAKke_Dx30lHA2FhPqk7osqI4enEDumKDHQI_QiVketKC_gbU8IDZRYuu7hfOHrXVbbiMc=w408-h306-k-no',
  'https://www.google.com/maps/search/aestheticplasticsurgeons%20https%3A%2F%2Faestheticplasticsurgeons.org%20UK',
  'First floor, 28-A, Jail Rd, Shadman II Shadman 2 Shadman, Lahore, 54000, Pakistan',
  NULL,
  'Aesthetic clinic',
  5,
  10,
  'Best plastic surgeon in Lahore, Pakistan. Best cosmetic surgeon, best aesthetic surgeon in Pakistan. Top plastic surgery clinic offering rhinoplasty, hair transplant, breast surgery, liposuction, facelift in Lahore, Islamabad, Faisalabad, Rawalpindi, Punjab Pakistan. Aestique Clinic — best plastic surgery clinic.',
  'https://aestiqueclinic.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'berkshireaesthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'maidenhead' LIMIT 1) AS `city_ref`),
  'Berkshire Aesthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnFCcJfs0QFG9K6-Sr9mH_k_PEBzeVvS7Mk0s4sWxNjiS8j8uWUYQ9yUGVdSSBJ21M1FCTCOPMKTXyGdM0LjLysEC6IVyltzg3Cv4Ktgd1IjmHvUuoPQ4OJMG0vuAK7lurhQRZXpaBAhclJ=w32-h32-p-k-no',
  'https://www.google.com/maps/search/berkshireaesthetics%20https%3A%2F%2Fberkshireaesthetics.com%20UK',
  'Furze Platt Rd, Maidenhead SL6 6PR, United Kingdom',
  '+44 1628 202028
',
  'Aesthetic clinic',
  4.8,
  203,
  'CQC-registered medical clinic in Maidenhead with GMC physician oversight. Consultation-first injectables, skin boosters, CoolSculpting and CO2 laser.',
  'https://www.berkshireaesthetics.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'choiceaesthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'croydon' LIMIT 1) AS `city_ref`),
  'Choiceaesthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmB-V0DA6dMJDqIMAykBf2qM7rY0fJuiskeKj9pt4DOjmnprVgWSg9dMrz-25DDaGJvRHUl60Ja0vWAGWfEN9LNtVc1yIsJXZHTvf2uGWAjHtI1pA1MUrA8hNYzpJVnuKptlhc=w32-h32-p-k-no',
  'https://www.google.com/maps/search/choiceaesthetics%20https%3A%2F%2Fchoiceaesthetics.uk%20UK',
  'Poppy Ln, Village, Croydon CR9 8AB, United Kingdom',
  '+44 7767 728108
',
  'Aesthetic clinic',
  4.9,
  35,
  'Miss Tadiparthi is a multi-award winning, highly experienced, London-based plastic surgeon, working in central London, Surrey and Kent.',
  'https://www.choiceaesthetics.uk/',
  'info@choiceaesthetics.uk',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'doctorbibi',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Doctorbibi',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlc4FzLcop5AMOYvcXXKjA-G3osqL-fyVef13QayOgvtj6_9GXZVrpXsbZtrMo8AjLLokzNrfvFoWLSMtbRUVW3fU5KRcNCYfATWvOB4KpZ8fQEoJqX8q2NKvO11NsatSPqUedybgDq6MY=w80-h106-k-no',
  'https://www.google.com/maps/place/Doctor+Bibi/@51.5174414,-2.4531802,8z/data=!3m1!5s0x48761ad4883a809b:0x43a847b1a36f1ba6!4m10!1m2!2m1!1sdoctorbibi+https:%2F%2Fdoctorbibi.co.uk+UK!3m6!1s0x48761bf32525c605:0xab09a1f0b6079e59!8m2!3d51.5174414!4d-0.1460513!15sCiZkb2N0b3JiaWJpIGh0dHBzOi8vZG9jdG9yYmliaS5jby51ayBVS1omIiRkb2N0b3JiaWJpIGh0dHBzIGRvY3RvcmJpYmkgY28gdWsgdWuSAQ5tZWRpY2FsX2NsaW5pY5oBRENpOURRVWxSUVVOdlpFTm9kSGxqUmpsdlQyNXNUMDlWYkZwWFNGRXhVbTE0Y2xJd1ZraE5hbVJ5WTBaR1dtVnJSUkFC4AEA-gEECAAQPw!16s%2Fg%2F11mwzgkdp0?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
  ', 10 Harley St, London W1G 9PF, United Kingdom',
  NULL,
  'Aesthetic clinic',
  4.9,
  81,
  'doctorbibi is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'https://doctorbibi.co.uk',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'doctorjonquillechantrey',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'doctorjonquillechantrey',
  'https://doctorjonquillechantrey.com/wp-content/uploads/2025/05/Dr-Jonquille-Banner.png',
  'https://www.google.com/maps/search/doctorjonquillechantrey%20https%3A%2F%2Fdoctorjonquillechantrey.com%20UK',
  'London, United Kingdom',
  '07412532637
01625585990

',
  'Aesthetic clinic',
  0,
  0,
  'BOOK A CONSULTATION TREATMENTS ØNE aesthetic studiø 12-14 South St, Alderley Edge SK9 7ES BY APPOINTMENT ONLY Doctor Jonquille Chantrey Global Thought Leader, Surgeon & Beauty Scientist A multi-award winning international expert, she is the winner of No.1 UK Doctor across all categories of doctors, dentists & plastic surgeons in the UK & Winner of […]',
  'https://doctorjonquillechantrey.com',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'dralexisgranite',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Dr Alexis Granite',
  'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=9kQBzg5z7unxbCaMW1uoIw&cb_client=search.gws-prod.gps&w=408&h=240&yaw=47.67594&pitch=0&thumbfov=100',
  'https://www.google.com/maps/search/dralexisgranite%20https%3A%2F%2Fdralexisgranite.com%20UK',
  'Skinesis Medical at Sarah Chapman, 259 Pavilion Rd, London SW1X 0BP, United Kingdom',
  '+44 20 7589 9585
',
  'Aesthetic clinic',
  5,
  1,
  'Consultant Dermatologist with expertise in general and cosmetic dermatology',
  'https://www.dralexisgranite.com/',
  'clinic@dralexisgranite.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drayad',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'leeds' LIMIT 1) AS `city_ref`),
  'Dr Ayad Aesthetics Clinic in Leeds',
  'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=pw_kuwJfQ7DUhNrjNIs7gQ&cb_client=search.gws-prod.gps&w=408&h=240&yaw=113.1725&pitch=0&thumbfov=100',
  'https://www.google.com/maps/search/drayad%20https%3A%2F%2Fdrayad.com%20UK',
  'Balcony Level, The Light the Headrow, Leeds LS1 8TL, United Kingdom',
  '+44 1335 313066
',
  'Aesthetic clinic',
  5,
  1,
  'drayad is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'https://drayad.com',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drcostaspapageorgiou',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Dr Costas Papageorgiou MD FACS',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkeFXGxA4pESE_vtEzBoSb5VW2Ory9STd4Z9gCCQrTFIToPvGnfxqIIdB0vBrhzvDpCykAgxtwg_WiyqBw618vNh35XyeVk7vILIjZHLuqTA52y223FS8xCt_cijhEmx9xUvOoyHA=w426-h240-k-no',
  'https://www.google.com/maps/search/drcostaspapageorgiou%20https%3A%2F%2Fdrcostaspapageorgiou.com%20UK',
  '87-135 Brompton Rd, London SW1X 7XL, United Kingdom',
  '+44 20 7225 5678
',
  'Aesthetic clinic',
  5,
  7,
  'drcostaspapageorgiou is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'http://www.drcostaspapageorgiou.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drderrickphillips',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Drderrickphillips',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkJuFfWU5mX9frUouvpwJjamFCRkmaAuIcLPEwRaY8UMigdswIa-m--9R4aHstHCixxS3wDqDvWO-sotV-0_y-CIl9Tk2zJ6UBuw5j-fQihf-OB6SYrI5NxNjNM5B3jnH_gynbKeszlkPM=w32-h32-p-k-no',
  'https://www.google.com/maps/search/drderrickphillips%20https%3A%2F%2Fdrderrickphillips.com%20UK',
  ', 55 Harley St, London W1G 8QR, United Kingdom',
  '020 3307 9355
',
  'Aesthetic clinic',
  5,
  2,
  'Top private dermatologist London: Dr Derrick Phillips is a leading skin specialist and acne dermatologist offering expert, customised care. Accepting new patients!',
  'https://drderrickphillips.com',
  'info@derrickphillips.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drelizabethhawkes',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Drelizabethhawkes',
  'https://drelizabethhawkes.com/data:image/webp;base64,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',
  'https://www.google.com/maps/place/Dr+Elizabeth+Hawkes/@51.4944106,-0.1630076,17z/data=!4m10!1m2!2m1!1sdrelizabethhawkes+https:%2F%2Fdrelizabethhawkes.com+UK!3m6!1s0x4876055f952e1913:0xc9ca082e1d1d9b4!8m2!3d51.4944106!4d-0.1585015!15sCjJkcmVsaXphYmV0aGhhd2tlcyBodHRwczovL2RyZWxpemFiZXRoaGF3a2VzLmNvbSBVS1oyIjBkcmVsaXphYmV0aGhhd2tlcyBodHRwcyBkcmVsaXphYmV0aGhhd2tlcyBjb20gdWuSAQdzdXJnZW9umgEkQ2hkRFNVaE5NRzluUzBWSlEwRm5TVU5NTjI4M01YUjNSUkFC4AEA-gEFCJcCEEY!16s%2Fg%2F11j8t9602y?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D',
  ', Sloane St, London SW1X 9BW, United Kingdom',
  '+44 7702 767200
',
  'Aesthetic clinic',
  4.6,
  56,
  'Dr Hawkes Clinic, led by Consultant Oculoplastic Surgeon Dr Elizabeth Hawkes — blepharoplasty expert and specialist in eyelid surgery, oculoplastics and facial aesthetics. Practising at Cadogan Clinic, Chelsea and The London Lauriston Clinic.',
  'https://www.drelizabethhawkes.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drgalyna',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'drgalyna',
  NULL,
  'https://www.google.com/maps/search/drgalyna%20https%3A%2F%2Fdrgalyna.com%20UK',
  'London, United Kingdom',
  NULL,
  'Aesthetic clinic',
  0,
  0,
  'drgalyna is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'https://drgalyna.com',
  'Galyna@drgalyna.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drhazlondon',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Mr. Hazim Sadideen',
  'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=vlnAe1jJwi4KMZiYATZauA&cb_client=search.gws-prod.gps&w=408&h=240&yaw=252.61223&pitch=0&thumbfov=100',
  'https://www.google.com/maps/search/drhazlondon%20https%3A%2F%2Fdrhazlondon.com%20UK',
  '120 Sloane St, London SW1X 9BW, United Kingdom',
  '+44 20 7370 6322
',
  'Aesthetic clinic',
  5,
  26,
  'Dr. Hazim Sadideen is a Consultant Plastic and Reconstructive Surgeon. He is a specialist in breast, body and facial surgery. He offers bespoke regenerative treatments, both surgical and non-surgical. Book your consultation by visiting drhazlondon.com',
  'https://www.drhazlondon.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drjacquelinelewis',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Dr Jacqueline Lewis',
  'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=vlnAe1jJwi4KMZiYATZauA&cb_client=search.gws-prod.gps&w=408&h=240&yaw=252.61223&pitch=0&thumbfov=100',
  'https://www.google.com/maps/search/drjacquelinelewis%20https%3A%2F%2Fdrjacquelinelewis.com%20UK',
  '120 Sloane St, London SW1X 9BW, United Kingdom',
  NULL,
  'Aesthetic clinic',
  4.4,
  38,
  'Specialising in cosmetic surgery, plastic surgery and non surgical procedures in the UK, Dr Jacqueline Lewis is an expert in women’s wellbeing.',
  'https://drjacquelinelewis.com',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drmaryamzamani',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Dr Maryam Zamani',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmR674JrKzjewAj0uREdWE06TusTeaTAW9yEyBJ-8M1TAOLlCLVMC38EMSgSQaUeIdT99HsartXmRVuyx2lG_X24upBo_1ssn0k4qOJWg_fUfUoEmAlI9TZ5vSz-sTFK8IrBd9F=w408-h538-k-no',
  'https://www.google.com/maps/search/drmaryamzamani%20https%3A%2F%2Fdrmaryamzamani.com%20UK',
  '110-112 King''s Rd, London SW3 4TX, United Kingdom',
  '+44 20 3955 9700
',
  'Aesthetic clinic',
  4.7,
  227,
  'Transform tired-looking eyes with expert blepharoplasty. Dr Maryam Zamani offers personalized eyelid surgery at her award-winning London clinic. Book your consultation today.',
  'http://www.drmaryamzamani.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drpamelabenito',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Dr. Pamela Benito',
  'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=ZdLFtnsdIUZ3wQnuXfyILA&cb_client=search.gws-prod.gps&w=408&h=240&yaw=254.93913&pitch=0&thumbfov=100',
  'https://www.google.com/maps/search/drpamelabenito%20https%3A%2F%2Fdrpamelabenito.com%20UK',
  'Flat 2, Bradbrook House, Studio Pl, London SW1X 8EL, United Kingdom',
  '+44 7387 775935
',
  'Aesthetic clinic',
  5,
  1,
  'Experience the art of beautification within a luxurious private clinic, where your aesthetic goals are defined.',
  'https://drpamelabenito.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drritarakus',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Rakus Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlPBgWaRryo74NVXXSdPnDrdqgh45PjEEHjxeljwUX_PzkTqQjXSuCxl2fxoJ4-jPlRdKyxW57lxIrknzOJb-LCZN7s1CYUfJPNUVG4iU9MREGCw4IRT6tPoQfK0UQoBz_4oTA=w408-h272-k-no',
  'https://www.google.com/maps/search/drritarakus%20https%3A%2F%2Fdrritarakus.co.uk%20UK',
  '34 Hans Rd, London SW3 1RW, United Kingdom',
  '+44 20 7460 7324
',
  'Aesthetic clinic',
  4.8,
  274,
  'Discover award-winning aesthetic treatments at Dr Rita Rakus Clinic in Knightsbridge, London. Specialists in facial rejuvenation, lip enhancement, and body contouring.',
  'http://www.rakusclinic.com/',
  'clinic@drritarakus.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drsebagh',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Dr Sebagh',
  'https://lh3.googleusercontent.com/gps-proxy/ALd4DhHIEGs88uA2oG8Yin39Uu7lPFhzuboF0hsLXnxk_sOlSroVEwfF3sfjaljTC6_9TGHk7jcYyf5r8rd3RUtXKXIrB1-ZWf68Z6m85eDYOF9usRYYr20QRhTYiBAjwRjq_dwro7L6504Po06T3UIXJPkGwZlh2JYT3ma5jZVz1Uyu8pTSMEU3IqafRvDsaOv_k1p57AU=w426-h240-k-no',
  'https://www.google.com/maps/search/drsebagh%20https%3A%2F%2Fdrsebagh.com%20UK',
  'Chandos House, 2 Queen Anne St, London W1G 9LQ, United Kingdom',
  '+44 20 7637 0548
',
  'Aesthetic clinic',
  4.1,
  73,
  'drsebagh is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'https://www.drsebagh.com/clinic',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drsohereroked',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Dr Sohere Roked',
  'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=3Iue8n0_tyOXzm59pN0X2Q&cb_client=search.gws-prod.gps&w=408&h=240&yaw=275.32407&pitch=0&thumbfov=100',
  'https://www.google.com/maps/search/drsohereroked%20https%3A%2F%2Fdrsohereroked.co.uk%20UK',
  'Omniya, 3A Montpelier St, London SW7 1EX, United Kingdom',
  '+44 20 7584 4777
',
  'Aesthetic clinic',
  4.8,
  16,
  'Dr. Sohère Roked is an experienced integrative medicine doctor based in London, specialising in hormone optimisation, health, wellbeing, and sustainable weight loss. Combining medical expertise with holistic healing, she offers a unique approach that blends functional medicine, emotional wellbeing, and intuitive practices such as breathwork, somatic healing, & retreats, supporting women through all stages of midlife, from perimenopause to postmenopause and beyond. Available in-person and online.',
  'http://drsohereroked.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drsophieshotter',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Dr Sophie Shotter - Medical Cosmetic Skin Clinic In London',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlRgcz0m1IZajeOe601yb-pzNo5xa02614Ej0YplcX5_BVw15w4mWsa6ATpIgdbpZSQhy-MruQVGjy7WdsKNfPlPp2fnEvAOWk1ankrzSD2WhkQuh10B_NjktYlQloSZjFzRauH7w=w408-h327-k-no',
  'https://www.google.com/maps/search/drsophieshotter%20https%3A%2F%2Fdrsophieshotter.com%20UK',
  '10 Harley St, London W1G 9PF, United Kingdom',
  '+44 20 8914 7987
',
  'Aesthetic clinic',
  5,
  22,
  'Dr. Sophie Shotter is a highly acclaimed medical aesthetic doctor in London and Kings Hill. Additionally, she is a well-respected aesthetics trainer and is a regular speaker and moderator at industry events.',
  'https://drsophieshotter.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'drwassimtaktouk',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Taktouk Clinic',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl17snmoHnZsRA49xVFCHdCeRHNz_Yf8XlHiNeDPvg3Bftj8iRZWJVdUrL95S1wgn459uWUKpwhFejEUXddRkxr6vyEXPEK3PB8i5WPQL2aLp8LC8hFVWgNm6yja42EICJ26b-8lw=w426-h240-k-no',
  'https://www.google.com/maps/search/drwassimtaktouk%20https%3A%2F%2Fdrwassimtaktouk.com%20UK',
  '56, Knightsbridge Court, 12 Sloane St, London SW1X 9LJ, United Kingdom',
  '+44 20 7235 7198
',
  'Aesthetic clinic',
  4.9,
  173,
  'Taktouk Clinic is the Aesthetic Medical and Laser Dermatology Clinic of Dr Wassim Taktouk in Knightsbridge, London.  The clinic offers injectables, dermal fillers, CO2 and laser skin resurfacing, thread lifts and PRP.',
  'http://www.drwassimtaktouk.com/',
  'info@drwassimtaktouk.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'facerestoration',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'FaceRestoration',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkmESAQcRzxXPO_-hQXQht75l4ix-B70iWE7fBqfnbAFtCESQb9HNGfkCxic5SUSJ0x1lEpw0oNla-dzBOi9J4hHNcKomYAF9W6DKxnEylNGy3t2UPdL4ilzKgIie9mzOwAIYQ_mg=w408-h306-k-no',
  'https://www.google.com/maps/search/facerestoration%20https%3A%2F%2Ffacerestoration.com%20UK',
  '75 Harley St, London W1G 9QW, United Kingdom',
  '+44 20 3983 8330
',
  'Aesthetic clinic',
  4.9,
  30,
  'Award Winning and Leading Oculoplastic Surgeons, specialising in natural-looking Results for diseases of the Eyes, Eyelids and Facial Aesthetics | Learn More',
  'http://www.facerestoration.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'facialsculpting',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Facialsculpting',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlK6v2BGcjxOuIdaIMlmkVroZMjncjD5HvTPEcb1VU5_A01_m8H9nuCyYfDwJbWHqq-r_wHxLWTJrF3kEu15GRYzCvbmPaEQ7rcSQ4DIeLOiiK_i2s4qZ6jsgmgB4YodIzUbWAcwCbP4-E=w80-h92-p-k-no',
  'https://www.google.com/maps/search/facialsculpting%20https%3A%2F%2Ffacialsculpting.co.uk%20UK',
  'London, United Kingdom',
  '+44 20 3951 9886

',
  'Aesthetic clinic',
  4.9,
  59,
  'Dr Nina Bal''s award-winning aesthetics clinic in South Kensington. Assessment-first facial sculpting, skin health and laser treatments. Book a consultation.',
  'https://facialsculpting.co.uk',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'gynae-expert',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'gynae expert',
  NULL,
  'https://www.google.com/maps/search/gynae%20expert%20https%3A%2F%2Fgynae-expert.co.uk%20UK',
  ', jail, Omar Hospital & Cardiac Centre 5, road, Shadman 2 Shadman, Lahore, 54000, Pakistan',
  '+44 333 322 2122
',
  'Aesthetic clinic',
  4.9,
  107,
  'Expert private menopause clinic led by a consultant gynaecologist. Clinics in Kent & London, with online appointments available across the UK.',
  'https://gynae-expert.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'harrods',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Harrods Lobby',
  'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=ke5O_w_NADaR5qc7iTv2EQ&cb_client=search.gws-prod.gps&w=408&h=240&yaw=302.64072&pitch=0&thumbfov=100',
  'https://www.google.com/maps/search/harrods%20https%3A%2F%2Fharrods.com%20UK',
  'Basil St, London SW1X 7XL, United Kingdom',
  NULL,
  'Aesthetic clinic',
  3.9,
  9,
  'harrods is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'https://www.harrods.com/en-gb/faqs/click-collect',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'hugohenderson',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Hugo Henderson',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlwx6ckpTTLMLwkPMysyj7tr22Jy8WdBwYL-5vJzdTfdpUC_43egP71XC1wztITm7UdNqcfQs4PJ8pgVitBaWIwJKFxTjC7P_CI4ZfrvwncmSn0S3JbzShR3nwy931gGMCzzWNx0A=w408-h326-k-no',
  'https://www.google.com/maps/search/hugohenderson%20https%3A%2F%2Fhugohenderson.com%20UK',
  'The London Clinic, 119 Harley St, London W1G 6AU, United Kingdom',
  '+44 20 7616 7657
',
  'Aesthetic clinic',
  5,
  6,
  'He also works privately at The London Clinic in Harley Street. He specialises in ophthalmic and reconstructive plastic surgery and aesthetic procedures such',
  'http://www.hugohenderson.com/',
  'secretary@hugohenderson.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'iainwhitaker',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'iainwhitaker',
  NULL,
  'https://www.google.com/maps/search/iainwhitaker%20https%3A%2F%2Fiainwhitaker.com%20UK',
  'London, United Kingdom',
  NULL,
  'Aesthetic clinic',
  0,
  0,
  'iainwhitaker is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'https://iainwhitaker.com',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'lips1',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'LPSA',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWn9MQCRE0BTH8RCUeBmTUr_kgedzvU8qf9I54dYVSgpVEMAAjlpTrvdgaugFygpdwBY9r7JIBll11fda2QGdeQVJMWUUa5dYc_g8YulTUo6lKlNaj-rYyns7gDICA86xcw7Crs=w426-h240-k-no',
  'https://www.google.com/maps/search/lips1%20https%3A%2F%2Flips1.co.uk%20UK',
  '70 Harley St, London W1G 7HF, United Kingdom',
  '+44 20 7580 4141
',
  'Aesthetic clinic',
  4,
  4,
  'Mr Roy Ng is  highly experienced and one of the UK’s most respected cosmetic and reconstructive plastic surgeons. He performs a wide range of procedures including rhinoplasty, Permalip lip implants, facial surgery, breast surgery and body contouring. His practice is based in Harley Street, central London.',
  'http://www.lips1.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'marcpacifico',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'tunbridge' LIMIT 1) AS `city_ref`),
  'Marc Pacifico Plastic Surgery',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkRFlaobPl_7_g-Nru43DTpUrwyNGTr5wTiFyctyz69HbXGMp8lVOX6ZnsAD1JMLVjswFrSK9GaKT-nnlPIp29Q_eL_fnGER2JBzzMGrHdUNph6sY3ktjy-DuedM3VibNwE1nYANzTMBZRu=w408-h600-k-no',
  'https://www.google.com/maps/search/marcpacifico%20https%3A%2F%2Fmarcpacifico.co.uk%20UK',
  '19 Mount Ephraim, Tunbridge Wells TN4 8AE, United Kingdom',
  '+44 1892 619635
',
  'Aesthetic clinic',
  4.8,
  54,
  'Discover Marc Pacifico’s bespoke plastic surgery treatments. From face to body, explore solutions designed for your aesthetic goals.',
  'http://www.marcpacifico.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'maryleboneskin',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'maryleboneskin',
  'http://static1.squarespace.com/static/62b9cd12eb552c3e9aa192d8/t/671a11a3abcf735b98abff5a/1729761699668/Primary+Logo+-+Burgundy.png?format=1500w',
  'https://www.google.com/maps/search/maryleboneskin%20https%3A%2F%2Fmaryleboneskin.co.uk%20UK',
  ', Unit 4, The Light Centre, 10 Portman Square, London W1H 6AZ, United Kingdom',
  '+44 20 7126 8305
',
  'Aesthetic clinic',
  5,
  19,
  'maryleboneskin is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'http://www.drdenning.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'millimetreperfect',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Millimetre Perfect',
  'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=s9p0EKgD5qcgDryQM8gZ9g&cb_client=search.gws-prod.gps&w=408&h=240&yaw=237.66803&pitch=0&thumbfov=100',
  'https://www.google.com/maps/search/millimetreperfect%20https%3A%2F%2Fmillimetreperfect.co.uk%20UK',
  '101 Harley St, London W1G 6AH, United Kingdom',
  '+44 20 3752 1565
',
  'Aesthetic clinic',
  5,
  57,
  'Expert cosmetic and reconstructive surgery at Millimetre Perfect, led by Consultant Plastic Surgeon Mr Raj Ragoowansi. Discover specialist care in Harley Street from one of London’s leading private plastic surgeons.',
  'http://millimetreperfect.co.uk/',
  'medsec@mmp.london',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'noranugent',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'tunbridge' LIMIT 1) AS `city_ref`),
  'Nora Nugent',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWm5p3ynsM1tkaABEeY0yEJ9iWb32X-YPOfmJo7HB95-Fp3SK0kYUWgFW6whnV5Hjl3qc9FlstZCyKTaFmUwtRCduz7d8kICOn99kPO-Qtwf57pjXzmmrzK6XhHmpsPo5No6Qbd8=w408-h272-k-no',
  'https://www.google.com/maps/search/noranugent%20https%3A%2F%2Fnoranugent.co.uk%20UK',
  'Purity Bridge, 19 Mount Ephraim, Tunbridge Wells TN4 8AE, United Kingdom',
  '+44 1892 619248
',
  'Aesthetic clinic',
  4.6,
  23,
  'Dr. Nora Nugent is a leading cosmetic plastic surgeon in Tunbridge Wells, Kent. Offering facial aesthetics, breast enhancement, body contouring & more.',
  'http://www.noranugent.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'orfaniotis',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Orfaniotis Plastic Surgery Ltd.',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkuqMIyXpcTMKySpdbTR9pzsiVLfw37nLiBEICv9eSKSEjDzr-GMkEygnWHK3k6WZQW2RvmhWovluu6tuLWtYwB6-VwXUsSHRqwP95KbFejKXu9K0NKgIFsOWoxXACKOC4GLhf9HQ=w408-h275-k-no',
  'https://www.google.com/maps/search/orfaniotis%20https%3A%2F%2Forfaniotis.co.uk%20UK',
  '19 W Eaton Pl, London SW1X 8LT, United Kingdom',
  NULL,
  'Aesthetic clinic',
  4.6,
  43,
  'Georgios Orfaniotis is a plastic surgeon in London specialising in facial and neck procedures. Over 15 years of expertise in aesthetic surgery.',
  'https://orfaniotis.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'perfecteyesltd',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Perfect Eyes Ltd.',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkTdti1EKSS_qhfLGsE7ERmF7mYaYooO83W_Q_JKgXaKXShEjqvYY0T3lEhD3IdX_o2pO8mosCfyJ1OTjNVOAgH52Gzy1vwVknWqTpaQYpBIRJzCibsCix_XqtvKy_KKdcLkaU=w408-h271-k-no',
  'https://www.google.com/maps/search/perfecteyesltd%20https%3A%2F%2Fperfecteyesltd.com%20UK',
  '121 Harley St, London W1G 6AX, United Kingdom',
  '+44 7458 082084
',
  'Aesthetic clinic',
  4.8,
  234,
  'perfecteyesltd is a UK aesthetic / medical clinic recognized in industry awards and guides.',
  'https://perfecteyesltd.com/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'puritybridge',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'tunbridge' LIMIT 1) AS `city_ref`),
  'Puritybridge',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkJ6Jj26ZeslyM7IEwXL1HTA5KofrqXb53pKVJ98iZrIT-Jiai9B87ebyOOtlD6XE1_x31JE90TVqnjFx778IBSi55zo_Fe0IwFgwL_7SidDB7uYcFqsla3Ykv0ine7g62aCJnw=w408-h408-k-no',
  'https://www.google.com/maps/search/puritybridge%20https%3A%2F%2Fpuritybridge.co.uk%20UK',
  '19 Mount Ephraim, Tunbridge Wells TN4 8AE, United Kingdom',
  '+44 1892 536960
',
  'Aesthetic clinic',
  5,
  20,
  'Purity Bridge is your premier choice for cosmetic surgery and plastic surgery in Tunbridge Wells. Our expert surgeons offer bespoke treatments tailored to your aesthetic goals. Experience world-class care at our top-rated clinic today.',
  'https://www.puritybridge.co.uk/',
  'info@puritybridge.co.uk',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'rajivgrover',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Rajiv Grover Facelift Surgery London UK',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlGmxNrdFcCcy2NYKW3H2lzjPF6EoLbdL0nINczN9NO1WfluCzBUdz3gmaC2EfJ_tGmzvAjnqpR55nX1DzhMbr1ifO3rCiaIfBhPBaray2xkvOUotBuYrSuHl_KhL01q4PUvLFF=w408-h544-k-no',
  'https://www.google.com/maps/search/rajivgrover%20https%3A%2F%2Frajivgrover.co.uk%20UK',
  '94 Harley St, London W1G 7HX, United Kingdom',
  '+44 20 7486 4301
',
  'Aesthetic clinic',
  4.9,
  38,
  'Rajiv Grover is a leading Plastic Surgeon and former President of BAAPS specialising in facelift surgery delivered with experience, artistry, and compassion.',
  'http://www.rajivgrover.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'realplasticsurgery',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Mr Naveen Cavale - Real Plastic Surgery',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWm0vHTA3Q_NLUnJJ8bJVcaF2_cBUurQeGdzrdyifn3feFvVabfTN1IW1ngIMgAox9eCIf-CgGc3_2JyLH5U4Ux6DduJ42LjQUfo9gEQ7I5XJZ2qqImHhNBbn_4O2Jwd4KzKn5E2=w408-h306-k-no',
  'https://www.google.com/maps/search/realplasticsurgery%20https%3A%2F%2Frealplasticsurgery.co.uk%20UK',
  'Battersea Exchange, 25 Patcham Terrace, Nine Elms, London SW8 4EX, United Kingdom',
  '+44 20 3031 0820
',
  'Aesthetic clinic',
  4.6,
  45,
  'Real Plastic Surgery is an expert clinic in the heart of Battersea, run by Mr. Naveen Cavale, and provides personalised cosmetic procedures in London.',
  'http://www.realplasticsurgery.co.uk/',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'rhinoplastylondon',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Rhinoplastylondon',
  NULL,
  'https://www.google.com/maps/search/rhinoplastylondon%20https%3A%2F%2Frhinoplastylondon.co.uk%20UK',
  ', Floor 1M, Tempus Belgravia, 11a W Halkin St, London SW1X 8JL, United Kingdom',
  '+44 20 3196 0130
',
  'Aesthetic clinic',
  4.8,
  75,
  'Leading London rhinoplasty clinic specialising in nose reshaping and nose surgery for stunning, natural results and enhanced confidence.',
  'https://rhinoplastylondon.co.uk/',
  'office@eastandbadia.com',
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

INSERT INTO `clinics` (
  `slug`, `cityId`, `name`, `image`, `gmapsUrl`, `gmapsAddress`, `gmapsPhone`, `category`,
  `rating`, `reviewCount`, `aboutSection`, `website`, `email`, `claimed`, `createdAt`, `updatedAt`
) VALUES (
  'sthetics',
  (SELECT `id` FROM (SELECT `id` FROM `cities` WHERE `slug` = 'london' LIMIT 1) AS `city_ref`),
  'Sthetics',
  'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk5Z4aCP2Ku4HNYLAlJZeZ8V7KgawbzYItO_PpfLUMM88IOdpcQjMx3SPheP4x6-55clpIzVqB9Z9AJnR0Q-S2lqApPTWTDCZSDfLJD3xygHpIErhn4jqC80MMkg6tA1YWP3krJh9WwxyKe=w32-h32-p-k-no',
  'https://www.google.com/maps/search/sthetics%20https%3A%2F%2Fsthetics.co.uk%20UK',
  ', 15 Harley St, London W1G 9QQ, United Kingdom',
  NULL,
  'Aesthetic clinic',
  4.9,
  59,
  'Discover advanced non-surgical treatments for face, body, and hair at S-Thetics in Beaconsfield Old Town. Book your consultation today for personalised care.',
  'https://sthetics.co.uk',
  NULL,
  0,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `cityId` = VALUES(`cityId`),
  `name` = VALUES(`name`),
  `image` = VALUES(`image`),
  `gmapsUrl` = VALUES(`gmapsUrl`),
  `gmapsAddress` = VALUES(`gmapsAddress`),
  `gmapsPhone` = VALUES(`gmapsPhone`),
  `category` = VALUES(`category`),
  `rating` = VALUES(`rating`),
  `reviewCount` = VALUES(`reviewCount`),
  `aboutSection` = VALUES(`aboutSection`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `updatedAt` = NOW(3);

