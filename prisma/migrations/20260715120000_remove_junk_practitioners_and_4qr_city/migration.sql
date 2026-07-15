DELETE FROM `practitioners`
WHERE `slug` IN (
  'aaaaaaana-jefford',
  'aaaaaaasaaaasa-turner',
  'aaaaasaaine-larkin',
  'derna-oaaaaaaaaaaaaaaa34aaleary-hughes',
  'dr-aaaaaasaaukasz-kowalik',
  'dr-aaaaasaaaaaaasaaigo-de-felipe-y-gaaaaasaarate',
  'dr-alina-auaaaaaasaarienaaaa34aaaasaaaa',
  'dr-alison-oaaaaaaaaaaaaaaa34aabrien',
  'dr-aryan-alaaaaaaaaaaaaaaaa34aaaldeen',
  'dr-camilo-daaaaasaaaz',
  'dr-ciaraaaaasaan-dolan',
  'dr-eleanor-aaaaaaaaaaaa1aaellieaaaaaaaaaaaaaaa34aa-johnson',
  'dr-f-k-halesaaaaaaaaaaaaaasaaahill',
  'dr-filiz-altaaaa34aasaaoaaaa34aaaa-lu-aaaaaaasaaaaaaa34aasaaaaaa34aaaa',
  'dr-ian-oaaaaaaaaaaaaaaa34aaconnor',
  'dr-jonathan-oaaaaaaaaaaaaaaa34aakeeffe',
  'dr-nadim-niaaaaaaaaaaaaaaa34aaman',
  'dr-salomaaaaasaa',
  'dr-salomaaaaasaa-metreveli',
  'dr-salvar-bjaaaaasaarnsson',
  'dr-sherard-le-maaaaaasaatre',
  'dr-siobhaaaaasaan-helena-mcentee',
  'dr-siobhaaaaasaan-higgins',
  'draaaaaaaaaaaasaa-rachael-syvret',
  'gintaraaaa34aaaasaaaa-ruseckaite',
  'lorena-andrea-aaaaaaasaaaaberg',
  'natalia-kuaaaaaasaaoniar',
  'renaaaaasaae-cleovoulou',
  'siaaaaasaan-walley',
  'stefan-ake-arne-aaaaaaasaaaaberg',
  'tina-oaaaaaaaaaaaaaaa34aadoherty',
  'yobany-andraaaaasaas-de-jesaaaaasaaos-valencia-toro'
)
OR `slug` REGEXP '(.)\\1\\1'
OR `displayName` REGEXP '(.)\\1\\1';

INSERT INTO `cities` (`slug`, `name`, `createdAt`, `updatedAt`)
SELECT 'silsoe', 'Silsoe', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `cities` WHERE `slug` = 'silsoe' OR `name` = 'Silsoe'
);

UPDATE `clinics`
SET `cityId` = (
  SELECT `id` FROM (
    SELECT `id` FROM `cities`
    WHERE `slug` = 'silsoe' OR `name` = 'Silsoe'
    ORDER BY `id`
    LIMIT 1
  ) AS silsoe_city
)
WHERE `cityId` IN (
  SELECT `id` FROM (
    SELECT `id` FROM `cities`
    WHERE `slug` = '4qr' OR `name` IN ('4QR', '4qr')
  ) AS bad_city
)
OR (
  `slug` = 'k-trichology'
  AND (
    `cityId` IS NULL
    OR `cityId` IN (
      SELECT `id` FROM (
        SELECT `id` FROM `cities`
        WHERE `slug` = '4qr' OR `name` IN ('4QR', '4qr')
      ) AS bad_city_for_clinic
    )
  )
);

DELETE FROM `cities`
WHERE `slug` = '4qr' OR `name` IN ('4QR', '4qr');
