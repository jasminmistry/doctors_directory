
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Clinic, Practitioner } from '@/lib/types';
import fs from 'fs';
import path from 'path';
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

describe('PractitionerPage rendering', () => {
  afterEach(() => {
  cleanup();
  if (global.gc) {
    global.gc();
  }
});
  test.each(practitioners as Practitioner[])('Page test: $practitioner_name', async (clinic) => {
  //all city/clinic combinations render without crashing'
      

      let flag = false
      const slug = clinic.practitioner_name!;
      
      const clinic_details = practitioners.find((p) => p.practitioner_name === slug);
      const k = clinicIndex.get(JSON.parse(clinic_details!.Associated_Clinics!)[0])
      const cityslug = k?.City!;
      
      let rolesflag = false
      let qualificationsflag = false
      let experienceflag = false
      let insuranceflag = false
      let feesflag = false
      let hoursflag = false
      let paymentsflag = false
      

        const { unmount } = render(await TestPractitionerCount({ params: { cityslug, slug } }));
        flag = true

        console.log(`/directory/practitioners/${cityslug}/profile/${slug} rendered successfully`);
   
      try {

        const ulElements = screen.getAllByTestId('roles');
    

        ulElements.forEach(ul => {
          const liTags = ul.querySelectorAll('li');

          if (liTags.length === 0) {
            console.log("no li tags in Roles");
          } else {
            console.log(`Roles section has ${liTags.length} li tags`);
           rolesflag = true

            liTags.forEach(li => {
              const text =
                li.textContent?.replace(/(?:\u00A0|[\s]|\u200B|\u200C|\u200D|\uFEFF)/g, '').trim() ?? '';

              if (
                text.toLowerCase().includes("not listed") ||
                text.toLowerCase().includes("not public")
              ) {
                console.log("Roles section has not listed or not public");
              } else {
                console.log("Roles section has no not listed or not public");
              }

              if (text.toLowerCase().match(/[Ãâ][\x80-\xBF]/)) {
                console.log("mojibake");
              }
            });
          }
        });


      } catch (e) {
        console.log(`Roles Section Error at /directory/practitioners/${cityslug}/profile/${slug} ${e}`);
      }
      try {

        const ulElements = screen.getAllByTestId('qualifications');
    

        ulElements.forEach(ul => {
          const liTags = ul.querySelectorAll('li');

          if (liTags.length === 0) {
            console.log("no li tags in qualifications");
          } else {
            console.log(`qualifications section has ${liTags.length} li tags`);
            qualificationsflag = true

            liTags.forEach(li => {
              const text =
                li.textContent?.replace(/(?:\u00A0|[\s]|\u200B|\u200C|\u200D|\uFEFF)/g, '').trim() ?? '';

              if (
                text.toLowerCase().includes("not listed") ||
                text.toLowerCase().includes("not public")
              ) {
                console.log("qualifications section has not listed or not public");
              } else {
                console.log("qualifications section has no not listed or not public");
              }

              if (text.toLowerCase().match(/[Ãâ][\x80-\xBF]/)) {
                console.log("mojibake");
              }
            });
          }
        });


      } catch (e) {
        console.log(`qualifications Section Error at /directory/practitioners/${cityslug}/profile/${slug} ${e}`);
      }
      try {

        const ulElements = screen.getAllByTestId('experience');
    

        ulElements.forEach(ul => {
          const liTags = ul.querySelectorAll('li');

          if (liTags.length === 0) {
            console.log("no li tags in experience");
          } else {
            console.log(`experience section has ${liTags.length} li tags`);
            experienceflag = true

            liTags.forEach(li => {
              const text =
                li.textContent?.replace(/(?:\u00A0|[\s]|\u200B|\u200C|\u200D|\uFEFF)/g, '').trim() ?? '';

              if (
                text.toLowerCase().includes("not listed") ||
                text.toLowerCase().includes("not public")
              ) {
                console.log("experience section has not listed or not public");
              } else {
                console.log("experience section has no not listed or not public");
              }

              if (text.toLowerCase().match(/[Ãâ][\x80-\xBF]/)) {
                console.log("mojibake");
              }
            });
          }
        });


      } catch (e) {
        console.log(`experience Section Error at /directory/practitioners/${cityslug}/profile/${slug} ${e}`);
      }
      
      try {


        const ulElementsInsurance = screen.getAllByTestId('insurance');

        ulElementsInsurance.forEach(ul => {
          const liTags = ul.querySelectorAll('li');

          if (liTags.length === 0) {
            console.log("no li tags in Insurance");
          } else {
            console.log(`insurance section has ${liTags.length} li tags`);
            insuranceflag = true

            liTags.forEach(li => {
              const text =
                li.textContent?.replace(/(?:\u00A0|[\s]|\u200B|\u200C|\u200D|\uFEFF)/g, '').trim() ?? '';

              if (text.toLowerCase().match(/[Ãâ][\x80-\xBF]/)) {
                console.log("mojibake found");
              }
            });
          }
        });

      } catch (e) {
        console.log(`Insurance Section Error at /directory/practitioners/${cityslug}/profile/${slug} ${e}`);
      }
      try {

        const feesTable = screen.getAllByTestId('fees');

        feesTable.forEach(ul => {
          const trTags = ul.querySelectorAll('tr');

          if (trTags.length === 0) {
            console.log("no tr tags in Fees");
          } else {
            console.log(`Fees section has ${trTags.length} tr tags`);
            feesflag = true

            trTags.forEach(tr => {
              const tds = tr.querySelectorAll('td');

              tds.forEach(td => {
                const text =
                  td.textContent?.replace(/(?:\u00A0|[\s]|\u200B|\u200C|\u200D|\uFEFF)/g, '').trim() ?? '';

                if (text.toLowerCase().match(/[Ãâ][\x80-\xBF]/)) {
                  console.log("mojibake found");
                }
              });
            });
          }
        });


      } catch (e) {
        console.log(`Fees Section Error at /directory/practitioners/${cityslug}/profile/${slug} ${e}`);
      }
      try {

        const hoursTable = screen.getAllByTestId('hours');

        hoursTable.forEach(ul => {
          const trTags = ul.querySelectorAll('tr');

          if (trTags.length === 0) {
            console.log("no tr tags in Hours");
          } else {
            console.log(`Hours section has ${trTags.length} tr tags`);
            hoursflag = true

            trTags.forEach(tr => {
              const tds = tr.querySelectorAll('td');

              tds.forEach(td => {
                const text =
                  td.textContent?.replace(/(?:\u00A0|[\s]|\u200B|\u200C|\u200D|\uFEFF)/g, '').trim() ?? '';

                if (text.toLowerCase().match(/[Ãâ][\x80-\xBF]/)) {
                  console.log("mojibake");
                }
              });
            });
          }
        });

  
      } catch (e) {
        console.log(`Hours Section Error at /directory/practitioners/${cityslug}/profile/${slug} ${e}`);
      }
      try {
       

        const ulElementPayments = screen.getAllByTestId('payments');

        ulElementPayments.forEach(ul => {
          const liTags = ul.querySelectorAll('li');

          if (liTags.length === 0) {
            console.log("no li tags in payments");
          } else {
            console.log(`payments section has ${liTags.length} li tags`);
            paymentsflag = true

            liTags.forEach(li => {
              const text =
                li.textContent?.replace(/(?:\u00A0|[\s]|\u200B|\u200C|\u200D|\uFEFF)/g, '').trim() ?? '';

              if (text.toLowerCase().match(/[Ãâ][\x80-\xBF]/)) {
                console.log("mojibake");
              }
            });
          }
        });

    
      } catch (e) {
        console.log(`Payments Section Error at /directory/practitioners/${cityslug}/profile/${slug} ${e}`);
      }
      unmount();
      const failures: string[] = [];

      if (!flag) failures.push("Render failed");
      if (!rolesflag) failures.push("Roles section failed");
      if (!qualificationsflag) failures.push("Qualifications section failed");  
      if (!experienceflag) failures.push("Experience section failed");      
      if (!insuranceflag) failures.push("Insurance section failed");
      if (!feesflag) failures.push("Fees section failed");
      if (!hoursflag) failures.push("Hours section failed");
      if (!paymentsflag) failures.push("Payments section failed");

      if (failures.length > 0) {
        throw new Error(
          `\nClinic ${slug} (${cityslug}) failed:\n` +
          failures.map(f => ` - ${f}`).join("\n")
        );
      }


        
  });


});


