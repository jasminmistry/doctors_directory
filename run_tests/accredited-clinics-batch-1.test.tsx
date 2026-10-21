import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Clinic } from '@/lib/types';
import fs from 'fs';
import path from 'path';
import { locations, modalities } from '@/lib/data';
import TestAccreditedClinics from '@/components/test/testAccreditedClinics';

const logFile = fs.createWriteStream('test-accredited-clinics-batch-1.log', { flags: 'w' });
const originalLog = console.log;
console.log = (...args) => {
  originalLog(...args);
  logFile.write(args.join(' ') + '\n');
};

const accreditations = ['cqc', 'jccp', 'hiw', 'his', 'rqia', 'saveface'];
const city_accreditations = locations.flatMap((cityslug) =>
  accreditations.map((accreditation) => ({
    accreditation,
    cityslug,
  }))
);

describe('AccreditedClinicsPage rendering', () => {

  test.each(city_accreditations)(
    'Page test: $accreditation / $cityslug',
    async ({ accreditation, cityslug }) => {
      let renderFlag = false;
      let cardFlag = false;
      try {
        const { unmount } = render(await TestAccreditedClinics({ params: { accreditation, cityslug } }));

        const ClinicsList = screen.getAllByTestId('practitioner-card');

        console.log(
          `/directory/accredited/${accreditation}/clinics/${cityslug}: ${ClinicsList.length} cards found.`
        );

        renderFlag = true;
        cardFlag = ClinicsList.length > 0;
        unmount();

      } catch (e) {
        console.log(
          `Error at /directory/accredited/${accreditation}/clinics/${cityslug}`
        );
      }
      const failures: string[] = [];
      if (!renderFlag) failures.push("Render failed");
      if (!cardFlag) failures.push("No cards found");

      if (failures.length > 0) {
        throw new Error(
          `\n/directory/accredited/${accreditation}/clinics/${cityslug} failed:\n` +
          failures.map(f => ` - ${f}`).join("\n")
        );
      }
    }
  );

});
