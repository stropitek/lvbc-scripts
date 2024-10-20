import assert from 'node:assert';
import process from 'node:process';
import { parseArgs } from 'node:util';

import chalk from 'chalk';
import { groupBy } from 'lodash-es';

import {
  mergedMatches,
  SEASON_START,
  VBManagerInputFile,
} from '../scripts/2024/params.mjs';
import { translateLeagueToClubdesk } from '../utils/clubdesk.mjs';
import {
  CLUBDESK_LEAGUE,
  CLUBDESK_UID,
  DATE,
  GENDER,
  LEAGUE,
  LOCATION,
  MATCH_ID,
  SCORER_ID,
  TEAM_AWAY,
  TEAM_HOME,
} from '../utils/constants.mjs';
import { isApproximatelySameDate } from '../utils/date.mjs';
import { debugFile } from '../utils/debug.mjs';
import {
  logMatchConflicts,
  logMatchDateChange,
  logMatches,
} from '../utils/log.mjs';
import { loadXlsx, writeXlsx } from '../utils/xlsx.mjs';

import {
  findConflict,
  getAvailabilityScore,
  getNameMismatchError,
  hasTraining,
} from './checks.mjs';
import { loadClubdeskScorers, normalizeScorerId } from './scorers.mjs';

const excludedMatchIDs = new Set(Object.values(mergedMatches).flat());
console.log({ excludedMatchIDs });

export async function loadVbmMatches() {
  return loadMatches(VBManagerInputFile);
}

export async function loadScoredVbmMatches() {
  const matches = await loadMatches(VBManagerInputFile);
  return filterHomeMatches(matches);
}

async function loadMatches(file, sheetName) {
  let data = await loadXlsx(file, sheetName);
  if (!data[0][MATCH_ID]) {
    data = await loadXlsx(file, sheetName, 1);
  }
  assertLooksLikeMatches(data);

  assertMatchDates(data);
  const filtered = data
    .filter((line) => line)
    .filter((line) => line[DATE].getTime() > SEASON_START)
    .filter(shouldIncludeMatch)
    .sort((line1, line2) => line1[DATE].getTime() - line2[DATE].getTime());

  return filtered;
}

function shouldIncludeMatch(match) {
  if (mergedMatches[match[MATCH_ID]]) {
    match.comment = match.comment || '';
    match.comment += `\nMerged with ${mergedMatches[match[MATCH_ID]].join(', ')}`;
  }

  const excluded = excludedMatchIDs.has(String(match[MATCH_ID]));
  return !excluded;
}

function filterHomeMatches(allMatches) {
  return allMatches.filter((match) => /Vennes/i.test(match[LOCATION]));
}

function assertMatchDates(matches) {
  for (let match of matches) {
    const offset = match[DATE].getTimezoneOffset();
    assert(
      offset === -120 || offset === -60,
      `The match date for ${match[MATCH_ID]} is not in the expected time zone.`,
    );
  }
}

export async function loadScoredMatches(file) {
  const teamWhichCanBeWithoutScorer = new Set(['M18G']);
  // File does not exist, continue

  const vbmMatches = await loadVbmMatches();
  let matches = await loadMatches(file);
  if (file === VBManagerInputFile) {
    matches = filterHomeMatches(matches);
  }

  const scorers = await loadClubdeskScorers();

  matches = matches.map((match) => {
    const vbm = vbmMatches.find((vbm) => vbm[MATCH_ID] === match[MATCH_ID]);
    assert(vbm, `Cannot find match ${match[MATCH_ID]} in VBManager file`);
    if (match[DATE].getTime() !== vbm[DATE].getTime()) {
      logMatches([match, vbm]);
      throw new Error('Date mismatch between scored sheet and VBM sheet');
    }

    // Make sure mandatory fields are present
    match[TEAM_HOME] = vbm[TEAM_HOME];
    match[TEAM_AWAY] = vbm[TEAM_AWAY];
    match[LOCATION] = vbm[LOCATION];
    match[LEAGUE] = vbm[LEAGUE];
    match[GENDER] = vbm[GENDER];
    match[SCORER_ID] = normalizeScorerId(match[SCORER_ID]);

    return match;
  });

  // Check that matches and scorers have the same league names
  const matchTeams = new Set(matches.map(translateLeagueToClubdesk));
  const playerTeams = new Set(scorers.map((scorer) => scorer[CLUBDESK_LEAGUE]));
  if (matchTeams.has(undefined) || playerTeams.has(undefined)) {
    throw new Error('Some matches or players have no league');
  }

  for (let team of matchTeams) {
    if (!playerTeams.has(team) && !teamWhichCanBeWithoutScorer.has(team)) {
      throw new Error(`No players for team ${team}`);
    }
  }

  if (process.env.debug) {
    const file = await debugFile('home_matches.xlsx');
    await writeXlsx(matches, file, 'Matches');
  }
  return matches;
}

export async function checkScoredMatches(scoredMatches) {
  const args = parseArgs({
    options: {
      scores: {
        type: 'boolean',
        short: 's',
      },
    },
  });

  const allMatches = await loadVbmMatches();
  const scorers = await loadClubdeskScorers();
  const scoredVbmMatches = await loadScoredVbmMatches();

  const conflicts = [];
  let notAssigned = [];
  let training = [];
  let changed = [];
  let invalidScorer = [];
  let nameMismatch = [];
  let missingMatches = [];

  for (let match of scoredVbmMatches) {
    if (
      !scoredMatches.find(
        (scoredMatch) => scoredMatch[MATCH_ID] === match[MATCH_ID],
      )
    ) {
      missingMatches.push(match);
    }
  }

  for (let match of scoredMatches) {
    const newMatch = allMatches.find(
      (vbMatch) => vbMatch[MATCH_ID] === match[MATCH_ID],
    );
    assert(newMatch, `Cannot find match ${match.id} in VBManager file`);
    if (!isApproximatelySameDate(newMatch[DATE], match[DATE])) {
      changed.push({ match, newMatch });
    }

    const nameError = getNameMismatchError(match);
    if (nameError) {
      match.error = nameError;
      nameMismatch.push(match);
    }

    const scorerID = match[SCORER_ID];
    if (!scorerID) {
      notAssigned.push(match);
    } else {
      const scorer = scorers.find(
        (scorer) => scorer[CLUBDESK_UID] === scorerID,
      );
      if (!scorer) {
        invalidScorer.push(match);
        continue;
      }
      match.availability = getAvailabilityScore(scorer, match);
      const conflictedMatch = findConflict(match, scorer);
      if (conflictedMatch) {
        conflicts.push([match, conflictedMatch]);
      }
      if (hasTraining(match, scorer[CLUBDESK_LEAGUE])) {
        training.push(match);
      }
    }
  }

  if (missingMatches.length > 0) {
    console.error(
      chalk.red(
        `There are ${missingMatches.length} matches in the VBManager file that are not listed`,
      ),
    );
    logMatches(missingMatches);
  }

  if (changed.length > 0) {
    console.error(
      chalk.red(`There are ${changed.length} matches with a new date`),
    );
    logMatchDateChange(changed);
  } else {
    console.log(chalk.green('No matches with a modified date.'));
  }

  if (notAssigned.length > 0) {
    console.error(
      chalk.red(
        `There are ${notAssigned.length} match with no assigned scorers`,
      ),
    );
  } else {
    console.log(chalk.green('All matches are assigned'));
  }
  if (conflicts.length > 0) {
    console.error(chalk.red(`There are ${conflicts.length} match conflicts`));
    logMatchConflicts(conflicts);
  } else {
    console.log(chalk.green('No match conflicts.'));
  }
  if (training.length > 0) {
    console.error(chalk.red(`There are ${training.length} training conflicts`));
    logMatches(training);
  } else {
    console.log(chalk.green('No training conflicts.'));
  }

  if (invalidScorer.length > 0) {
    console.error(
      `There are ${invalidScorer.length} matches with invalid scorer`,
    );
    logMatches(invalidScorer);
  } else {
    console.log(chalk.green('No invalid scorers.'));
  }

  if (nameMismatch.length > 0) {
    console.error(
      chalk.red(`There are ${nameMismatch.length} name vs UID mismatches`),
    );
    logMatches(nameMismatch, { error: true });
  }
  if (args.values.scores) {
    logMatches(scoredMatches, { availabilityScore: true });
  }
}

function assertLooksLikeMatches(matches) {
  for (let match of matches) {
    assert(match[MATCH_ID], 'No match ID');
    assert(
      match[DATE] instanceof Date && !Number.isNaN(match[DATE].getTime()),
      'Invalid date',
    );
  }
}

export function showAvailableMatches(scorer, assignedMatches) {
  let candidates = assignedMatches.slice();

  addAvailabilityScore(candidates, scorer);
  // Do not log matches which cannot be assigned
  candidates = candidates.filter((match) => match.availability.score > 0);
  // Split between unassigned and assigned matches
  const grouped = groupBy(candidates, (match) =>
    match[SCORER_ID] ? 'assigned' : 'unassigned',
  );
  if (grouped.assigned) {
    console.log(chalk.green('Assigned matches'));
    logMatches(grouped.assigned, { availabilityScore: true });
  }
  if (grouped.unassigned) {
    console.log(chalk.green('Unassigned matches'));
    logMatches(grouped.unassigned, { availabilityScore: true });
  }
}

export function addAvailabilityScore(matches, scorer) {
  for (let match of matches) {
    match.availability = getAvailabilityScore(scorer, match);
  }
}
