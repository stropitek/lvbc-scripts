import { parseArgs } from 'node:util';

import { initMatchAssignments, loadMatches } from '../core/matches.mjs';
import { SCORER_TEAM } from '../utils/constants.mjs';
import { logAssignmentLength } from '../utils/log.mjs';

import { canScoreMatch, hasTraining, logMatches } from './2023/checks.mjs';
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

for (let match of homeMatches) {
  const scorer = match[SCORER_TEAM];
  if (!scorer) {
    notAssigned.push(match);
  } else {
    if (!canScoreMatch(match, scorer, allMatches)) {
      conflicts.push(match);
    }
    if (hasTraining(match, scorer)) {
      training.push(match);
    }
  }
}

logAssignmentLength(assignments);

if (notAssigned.length > 0) {
  console.error(`There are ${notAssigned.length} match with no assigned team`);
  if (args.values.verbose) {
    logMatches(notAssigned);
  }
}
if (conflicts.length > 0) {
  console.error(`There are ${conflicts.length} match conflicts`);
  if (args.values.verbose) {
    logMatches(conflicts);
  }
}
if (training.length > 0) {
  console.error(`There are ${training.length} training conflicts`);
  if (args.values.verbose) {
    logMatches(training);
  }
}
