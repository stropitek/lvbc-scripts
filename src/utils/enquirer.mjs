import fs from 'node:fs/promises';

import enquirer from 'enquirer';

import { VBManagerInputFile } from '../scripts/2024/params.mjs';

const dir = 'files/external';

const externalSheets = (await fs.readdir(dir)).filter((file) =>
  file.endsWith('.xlsx'),
);

const matchesFileOptions = [
  VBManagerInputFile,
  ...externalSheets.map((file) => `${dir}/${file}`),
];
const selectPrompt = new enquirer.Select({
  name: 'Match sheet',
  message: 'Pick a match sheet to read from',
  choices: matchesFileOptions,
});

export function enquireAssignmentSheet() {
  return selectPrompt.run();
}
