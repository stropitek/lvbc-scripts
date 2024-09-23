import fs from 'node:fs/promises';

import enquirer from 'enquirer';

import { VBManagerInputFile } from '../scripts/2024/params.mjs';

const dir = 'files/external';

const externalSheets = (await fs.readdir(dir)).filter(
  (file) => file.endsWith('.xlsx') && !file.startsWith('~'),
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

const runPrompt = new enquirer.Select({
  name: 'Run task',
  message: 'What would you like to do with this sheet?',
  choices: ['Assign', 'Check'],
});

export function enquireAssignmentSheet() {
  return selectPrompt.run();
}

export function enquireRunTask() {
  return runPrompt.run();
}
