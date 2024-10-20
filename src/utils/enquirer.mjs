import fs from 'node:fs/promises';

import enquirer from 'enquirer';

import { getScorerFullName, loadClubdeskScorers } from '../core/scorers.mjs';
import { VBManagerInputFile } from '../scripts/2024/params.mjs';

import {
  TASK_ASSIGN,
  TASK_CHECK,
  TASK_UNASSIGNED,
  TASK_FIND_SCORER,
  TEAM_AWAY,
  TEAM_HOME,
  DATE,
  TASK_FIND_MATCH,
} from './constants.mjs';
import { displayDate } from './log.mjs';

const dir = 'files/external';

const externalSheets = (await fs.readdir(dir)).filter(
  (file) => file.endsWith('.xlsx') && !file.startsWith('~'),
);

const matchesFileOptions = [
  ...externalSheets.map((file) => `${dir}/${file}`),
  VBManagerInputFile,
];
const selectPrompt = new enquirer.Select({
  name: 'Match sheet',
  message: 'Pick a match sheet to read from',
  choices: matchesFileOptions,
});

const runPrompt = new enquirer.Select({
  name: 'Run task',
  message: 'What would you like to do with this sheet?',
  choices: [
    TASK_CHECK,
    TASK_FIND_SCORER,
    TASK_FIND_MATCH,
    TASK_UNASSIGNED,
    TASK_ASSIGN,
  ],
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

export async function enquireScorer() {
  const scorers = await loadClubdeskScorers();
  const prompt = new enquirer.AutoComplete({
    name: 'scorer',
    message: 'Pick a scorer',
    choices: scorers.map((scorer) => ({
      message: getScorerFullName(scorer),
      name: scorer,
    })),
  });
  return prompt.run();
}

export function enquireAssignmentSheet() {
  return selectPrompt.run();
}

export function enquireRunTask() {
  return runPrompt.run();
}
