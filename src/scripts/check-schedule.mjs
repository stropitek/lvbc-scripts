import assert from 'node:assert';
import { parseArgs } from 'node:util';

import { initMatchAssignments, loadMatches } from '../core/matches.mjs';
import { DATE, MATCH_ID, SCORER_TEAM } from '../utils/constants.mjs';
import { isApproximatelySameDate } from '../utils/date.mjs';
import { logAssignmentLength } from '../utils/log.mjs';

import {
  findConflict,
  hasTraining,
  logMatchConflicts,
  logMatchDateChange,
  logMatches,
} from './2023/checks.mjs';
import {
  tunedFile,
  tunedFileExternal,
  VBManagerInputFile,
} from './2023/params.mjs';

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
  },
});

const allMatches = await loadMatches(VBManagerInputFile);

const homeMatches = await loadMatches(
  args.values.external ? tunedFileExternal : tunedFile,
);
console.log(`loaded ${homeMatches.length} matches`);

const assignments = initMatchAssignments(homeMatches);

const conflicts = [];
let notAssigned = [];
let training = [];
let changed = [];

for (let match of homeMatches) {
  const newMatch = allMatches.find(
    (vbMatch) => vbMatch[MATCH_ID] === match[MATCH_ID],
  );
  assert(newMatch, `Cannot find match ${match.id} in VBManager file`);
  if (!isApproximatelySameDate(newMatch[DATE], match[DATE])) {
    changed.push({ match, newMatch });
  }
  const scorer = match[SCORER_TEAM];
  if (!scorer) {
    notAssigned.push(match);
  } else {
    const conflictedMatch = findConflict(match, scorer, allMatches);
    if (conflictedMatch) {
      conflicts.push([match, conflictedMatch]);
    }
    if (hasTraining(match, scorer)) {
      training.push(match);
    }
  }
}

logAssignmentLength(assignments);

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
