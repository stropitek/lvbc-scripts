import fs from 'node:fs/promises';

import enquirer from 'enquirer';

import { VBManagerInputFile } from '../scripts/2024/params.mjs';

import {
  TASK_ASSIGN,
  TASK_CHECK,
  TASK_UNASSIGNED,
  TASK_FIND_SCORER,
  TEAM_AWAY,
  TEAM_HOME,
  DATE,
} from './constants.mjs';
import { displayDate } from './log.mjs';

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
  choices: [TASK_CHECK, TASK_FIND_SCORER, TASK_UNASSIGNED, TASK_ASSIGN],
});

export function enquireMatch(matches) {
  const choices = matches.map((match) => {
    return {
      message: `${match[TEAM_HOME]} VS ${match[TEAM_AWAY]} - ${displayDate(match[DATE])}`,
      name: match,
    };
  });
  const prompt = new enquirer.Select({
    name: 'Match',
    message: 'Pick a match',
    choices,
  });
  return prompt.run();
}

export function enquireAssignmentSheet() {
  return selectPrompt.run();
}

export function enquireRunTask() {
  return runPrompt.run();
}
