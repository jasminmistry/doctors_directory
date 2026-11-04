import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Clinic } from '@/lib/types';
import fs from 'fs';
import path from 'path';
import { modalities } from '@/lib/data';
import TestTreatments from '@/components/test/testTreatments';

const logFile = fs.createWriteStream('test-treatments-batch-1.log', { flags: 'w' });
const originalLog = console.log;
console.log = (...args) => {
  originalLog(...args);
  logFile.write(args.join(' ') + '\n');
};

const treatment_tests = modalities.map((slug) => ({ slug }));

describe('TreatmentsPage rendering', () => {

  test.each(treatment_tests)(
    'Page test: $slug',
    async ({ slug }) => {
      let renderFlag = false;
      let cardFlag = false;
      try {
        const { unmount } = render(await TestTreatments({ params: { slug } }));

        const ClinicsList = screen.getAllByTestId('practitioner-card');

        console.log(
          `/directory/treatments/${slug}: ${ClinicsList.length} cards found.`
        );

        renderFlag = true;
        cardFlag = ClinicsList.length > 0;
        unmount();

      } catch (e) {
        console.log(
          `Error at /directory/treatments/${slug}`
        );
      }
      const failures: string[] = [];
      if (!renderFlag) failures.push("Render failed");
      if (!cardFlag) failures.push("No cards found");

      if (failures.length > 0) {
        throw new Error(
          `\n/directory/treatments/${slug} failed:\n` +
          failures.map(f => ` - ${f}`).join("\n")
        );
      }
    }
  );

});
