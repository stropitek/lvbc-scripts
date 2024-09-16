import fs from 'node:fs/promises';

import { filterHomeMatches, loadMatches } from '../core/matches.mjs';
import { loadClubdeskScorers } from '../core/scorers.mjs';
import { translateLeagueToClubdesk } from '../utils/clubdesk.mjs';
import {
  CLUBDESK_LEAGUE,
  SCORER_1,
  SCORER_2,
  SCORER_ID,
  SCORER_PHONE_1,
  SCORER_PHONE_2,
} from '../utils/constants.mjs';
import { writeXlsx } from '../utils/xlsx.mjs';

import { VBManagerInputFile, preassignedFile } from './2024/params.mjs';

try {
  await fs.access(preassignedFile);
  console.error(`File ${preassignedFile} already exists`);
} catch {
  // File does not exist, continue

  const matches = await loadMatches(VBManagerInputFile);
  const homeMatches = filterHomeMatches(matches);
  homeMatches[0][SCORER_ID] = '';
  homeMatches[0][SCORER_1] = '';
  homeMatches[0][SCORER_PHONE_1] = '';
  homeMatches[0][SCORER_2] = '';
  homeMatches[0][SCORER_PHONE_2] = '';

  // Check that matches and scorers have the same league names
  const scorers = await loadClubdeskScorers();
  const matchTeams = new Set(homeMatches.map(translateLeagueToClubdesk));
  const playerTeams = new Set(scorers.map((scorer) => scorer[CLUBDESK_LEAGUE]));
  if (matchTeams.has(undefined) || playerTeams.has(undefined)) {
    throw new Error('Some matches or players have no league');
  }

  for (let team of matchTeams) {
    if (!playerTeams.has(team)) {
      throw new Error(`No players for team ${team}`);
    }
  }

  await writeXlsx(homeMatches, preassignedFile, 'Sheet1', [SCORER_ID]);
}
