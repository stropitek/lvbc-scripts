import assert from 'node:assert';
import process from 'node:process';
import { parseArgs } from 'node:util';

import chalk from 'chalk';

import {
  findConflict,
  getAvailabilityScore,
  hasTraining,
} from '../scripts/2024/checks.mjs';
import { SEASON_START, VBManagerInputFile } from '../scripts/2024/params.mjs';
import { translateLeagueToClubdesk } from '../utils/clubdesk.mjs';
import {
  CLUBDESK_LEAGUE,
  CLUBDESK_UID,
  DATE,
  LOCATION,
  MATCH_ID,
  SCORER_ID,
  SCORER_TEAM,
} from '../utils/constants.mjs';
import { isApproximatelySameDate } from '../utils/date.mjs';
import { debugFile } from '../utils/debug.mjs';
import {
  logMatchConflicts,
  logMatchDateChange,
  logMatches,
} from '../utils/log.mjs';
import { loadXlsx, writeXlsx } from '../utils/xlsx.mjs';

import { loadClubdeskScorers } from './scorers.mjs';
import { getTeams, isLausanneTeam } from './teams.mjs';

export async function loadVbmMatches() {
  return loadMatches(VBManagerInputFile);
}

export async function loadMatches(file, sheetName) {
  const data = await loadXlsx(file, sheetName);
  return filterAndSortMatches(data);
}

function filterAndSortMatches(matches) {
  assertMatchDates(matches);
  return matches
    .filter((line) => line)
    .filter((line) => line[DATE].getTime() > SEASON_START)
    .sort((line1, line2) => line1[DATE].getTime() - line2[DATE].getTime());
}

export function initMatchTeamAssignments(allMatches) {
  const teams = getTeams(allMatches);
  const lausanneTeams = teams.filter(isLausanneTeam);

  const assignedMatchesPerTeam = {};
  for (let team of lausanneTeams) {
    assignedMatchesPerTeam[team] = [];
  }

  for (let match of allMatches) {
    const scorer = match[SCORER_TEAM];
    if (scorer) {
      assert(
        lausanneTeams.includes(scorer),
        `${scorer} is not a Lausanne team`,
      );
      assignedMatchesPerTeam[match[SCORER_TEAM]].push(match);
    } else {
      throw new Error(`no scorer team for match ${match[MATCH_ID]}`);
    }
  }
  return assignedMatchesPerTeam;
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

  let matches = await loadMatches(file);
  if (file === VBManagerInputFile) {
    matches = filterHomeMatches(matches);
  }

  // Check that matches and scorers have the same league names
  const scorers = await loadClubdeskScorers();
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
      verbose: {
        type: 'boolean',
        short: 'v',
      },
      scores: {
        type: 'boolean',
        short: 's',
      },
    },
  });

  const allMatches = await loadVbmMatches();
  const scorers = await loadClubdeskScorers();

  const conflicts = [];
  let notAssigned = [];
  let training = [];
  let changed = [];
  let invalidScorer = [];

  for (let match of scoredMatches) {
    const newMatch = allMatches.find(
      (vbMatch) => vbMatch[MATCH_ID] === match[MATCH_ID],
    );
    assert(newMatch, `Cannot find match ${match.id} in VBManager file`);
    if (!isApproximatelySameDate(newMatch[DATE], match[DATE])) {
      changed.push({ match, newMatch });
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
    if (args.values.verbose) {
      logMatchConflicts(conflicts);
    }
  } else {
    console.log(chalk.green('No match conflicts.'));
  }
  if (training.length > 0) {
    console.error(chalk.red(`There are ${training.length} training conflicts`));
    if (args.values.verbose) {
      logMatches(training);
    }
  } else {
    console.log(chalk.green('No training conflicts.'));
  }

  if (invalidScorer.length > 0) {
    console.error(
      `There are ${invalidScorer.length} matches with invalid scorer`,
    );
    if (args.values.verbose) {
      logMatches(invalidScorer);
    }
  } else {
    console.log(chalk.green('No invalid scorers.'));
  }

  if (args.values.scores) {
    logMatches(scoredMatches, { availabilityScore: true });
  }
}
