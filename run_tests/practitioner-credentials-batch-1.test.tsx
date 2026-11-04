import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Clinic } from '@/lib/types';
import fs from 'fs';
import path from 'path';
import { edu, accreditations } from '@/lib/data';
import TestPractitionerCredentials from '@/components/test/testPractitionerCredentials';

const logFile = fs.createWriteStream('test-practitioner-credentials-batch-1.log', { flags: 'w' });
const originalLog = console.log;
console.log = (...args) => {
  originalLog(...args);
  logFile.write(args.join(' ') + '\n');
};

const credentials = [...edu, ...accreditations].map(c => c.toLowerCase().replace(/\s+/g, '-'));

describe('PractitionerCredentialsPage rendering', () => {

  test.each(credentials.map((cred) => ({ cred })))(
    'Page test: $cred',
    async ({ cred }) => {
      let renderFlag = false;
      let cardFlag = false;
      try {
        const { unmount } = render(await TestPractitionerCredentials({ params: { cred } }));

        const PractitionersList = screen.getAllByTestId('practitioner-card');

        console.log(
          `/directory/practitioners/credentials/${cred}: ${PractitionersList.length} cards found.`
        );

        renderFlag = true;
        cardFlag = PractitionersList.length > 0;
        unmount();

      } catch (e) {
        console.log(
          `Error at /directory/practitioners/credentials/${cred}`
        );
      }
      const failures: string[] = [];
      if (!renderFlag) failures.push("Render failed");
      if (!cardFlag) failures.push("No cards found");

      if (failures.length > 0) {
        throw new Error(
          `\n/directory/practitioners/credentials/${cred} failed:\n` +
          failures.map(f => ` - ${f}`).join("\n")
        );
      }
    }
  );

});
