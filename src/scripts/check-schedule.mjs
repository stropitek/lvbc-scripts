import assert from 'node:assert';
import { parseArgs } from 'node:util';

import { loadMatches, loadVBManagerMatches } from '../core/matches.mjs';
import { loadClubdeskScorers } from '../core/scorers.mjs';
import {
  CLUBDESK_LEAGUE,
  CLUBDESK_UID,
  DATE,
  MATCH_ID,
  SCORER_ID,
} from '../utils/constants.mjs';
import { isApproximatelySameDate } from '../utils/date.mjs';
import {
  logMatchConflicts,
  logMatchDateChange,
  logMatches,
} from '../utils/log.mjs';

import {
  findConflict,
  getAvailabilityScore,
  hasTraining,
} from './2024/checks.mjs';
import { tunedFile, tunedFileExternal } from './2024/params.mjs';

const args = parseArgs({
  options: {
    external: {
      type: 'boolean',
      short: 'n',
    },
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

const allMatches = await loadVBManagerMatches();
const scorers = await loadClubdeskScorers();

const file = args.values.external ? tunedFileExternal : tunedFile;
const scoredMatches = await loadMatches(file);
console.log(`loaded ${scoredMatches.length} matches from ${file}`);

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
    const scorer = scorers.find((scorer) => scorer[CLUBDESK_UID] === scorerID);
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
  console.error(`There are ${changed.length} matches with a new date`);
  logMatchDateChange(changed);
}

if (notAssigned.length > 0) {
  console.error(`There are ${notAssigned.length} match with no assigned team`);
  if (args.values.verbose) {
    logMatches(notAssigned);
  }
}
if (conflicts.length > 0) {
  console.error(`There are ${conflicts.length} match conflicts`);
  if (args.values.verbose) {
    logMatchConflicts(conflicts);
  }
}
if (training.length > 0) {
  console.error(`There are ${training.length} training conflicts`);
  if (args.values.verbose) {
    logMatches(training);
  }
}

if (invalidScorer.length > 0) {
  console.error(
    `There are ${invalidScorer.length} matches with invalid scorer`,
  );
  if (args.values.verbose) {
    logMatches(invalidScorer);
  }
}

if (args.values.scores) {
  logMatches(scoredMatches, { availabilityScore: true });
}
