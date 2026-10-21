//vercel ./test-reports
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import ClinicDetailsMarkdown from '@/components/Clinic/clinicDetailsMD';
import { Clinic, Practitioner } from '@/lib/types';
import fs from 'fs';
import path from 'path';
import { set } from 'zod';
import { locations, modalities } from '@/lib/data';
import TestServicesCount from '@/components/test/testServicesCount';
import TestTreatmentCount from '@/components/test/testTreatmentsCount';
import TestClinicsCount from '@/components/test/testClinicsCount';
import TestPractitionerCount from '@/components/test/testPractitionerCount';
import clinicsJson from "@/../public/clinics_processed_new_data.json";
const clinicsData = clinicsJson as unknown as Clinic[];
const clinics = clinicsData
  const clinicIndex = new Map(
  clinics.filter(c=>c.slug !== undefined).map(c => [c.slug!, c])
)
const logFile = fs.createWriteStream('ptest-1.log', { flags: 'w' });
const originalLog = console.log;
console.log = (...args) => {
  originalLog(...args);
  logFile.write(args.join(' ') + '\n');
};
const filePath = path.join(process.cwd(), 'public', 'derms_processed_new_5403.json');
const all_practitioners: Practitioner[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const practitioners = all_practitioners.slice(0,500)
const city_treatments = locations.flatMap((cityslug) =>
  modalities.map((treatmentslug) => ({
    cityslug,
    treatmentslug,
  }))
);

// describe('PractTreatmentPage rendering', () => {

//   test.each(city_treatments)(
//     'Page test: $cityslug / $treatmentslug',
//     ({ cityslug, treatmentslug }) => {

//       let renderFlag = false;
//       let cardFlag = false

//       try {
//         const { unmount } = render(
//           <TestTreatmentCount
//             params={{ cityslug, treatmentslug }}
//           />
//         );

//         const ClinicsList = screen.getAllByTestId('practitioner-card');
//         cardFlag = true

//         console.log(
//           `/directory/practitioners/${cityslug}/treatments/${treatmentslug}: ${ClinicsList.length} cards found.`
//         );

//         renderFlag = true;
//         unmount();

//       } catch (e) {
//         console.log(
//           `Error at /directory/practitioners/${cityslug}/treatments/${treatmentslug}`,
          
//         );
//       }
//       const failures: string[] = [];
//       if(!renderFlag) failures.push("Render failed");
//       if(!cardFlag) failures.push("No cards found");

//       if (failures.length > 0) {
//         throw new Error(
//           `\n/directory/practitioners/${cityslug}/treatments/${treatmentslug} failed:\n` +
//           failures.map(f => ` - ${f}`).join("\n")
//         );
//       }

   
//     }
//   );

// });
describe('ClinicTreatmentPage rendering', () => {

  test.each(city_treatments)(
    'Page test: $cityslug / $treatmentslug',
    async ({ cityslug, treatmentslug }) => {
      const serviceslug = treatmentslug
      

      let renderFlag = false;
      let cardFlag = false
      try {
        const { unmount } = render(await TestServicesCount({ params: { cityslug,serviceslug } }));

        const ClinicsList = screen.getAllByTestId('practitioner-card');

        console.log(
          `/directory/clinics/${cityslug}/services/${treatmentslug}: ${ClinicsList.length} cards found.`
        );

        renderFlag = true;
        unmount();

      } catch (e) {
        console.log(
          `Error at /directory/clinics/${cityslug}/services/${treatmentslug}`,
          
        );
      }
      const failures: string[] = [];
      if(!renderFlag) failures.push("Render failed");
      if(!cardFlag) failures.push("No cards found");
      
      if (failures.length > 0) {
        throw new Error(
          `\n/directory/clinics/${cityslug}/services/${treatmentslug} failed:\n` +
          failures.map(f => ` - ${f}`).join("\n")
        );
      }
    }
  );

});
