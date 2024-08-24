import fs from 'node:fs/promises';

import { filterHomeMatches, loadMatches } from '../core/matches.mjs';
import { translateLeagueToClubdesk } from '../utils/clubdesk.mjs';
import {
  LEAGUE_CLUBDESK,
  SCORER_1,
  SCORER_2,
  SCORER_PHONE_1,
  SCORER_PHONE_2,
} from '../utils/constants.mjs';
import { loadCSV } from '../utils/csv.mjs';
import { writeXlsx } from '../utils/xlsx.mjs';

import {
  VBManagerInputFile,
  playersFile,
  preassignedFile,
} from './2024/params.mjs';

try {
  await fs.access(preassignedFile);
  console.error(`File ${preassignedFile} already exists`);
} catch {
  // File does not exist, continue

  const matches = await loadMatches(VBManagerInputFile);
  const homeMatches = filterHomeMatches(matches);
  homeMatches[0][SCORER_1] = '';
  homeMatches[0][SCORER_2] = '';
  homeMatches[0][SCORER_PHONE_1] = '';
  homeMatches[0][SCORER_PHONE_2] = '';

  // Check that matches and players have the same league names
  const players = await loadCSV(playersFile);
  const matchTeams = new Set(homeMatches.map(translateLeagueToClubdesk));
  const playerTeams = new Set(players.map((player) => player[LEAGUE_CLUBDESK]));
  if (matchTeams.has(undefined) || playerTeams.has(undefined)) {
    throw new Error('Some matches or players have no league');
  }

  for (let team of matchTeams) {
    if (!playerTeams.has(team)) {
      throw new Error(`No players for team ${team}`);
    }
  }

  await writeXlsx(homeMatches, preassignedFile, 'Sheet1');
}
