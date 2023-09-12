import { initMatchAssignments, loadMatches } from '../core/matches.mjs';
import { SCORER_TEAM } from '../utils/constants.mjs';
import { logAssignmentLength } from '../utils/log.mjs';

import { canScoreMatch } from './2023/checks.mjs';
import { tunedFile, xlsxFile } from './2023/params.mjs';

const allMatches = await loadMatches(xlsxFile);
const homeMatches = await loadMatches(tunedFile);

const assignments = initMatchAssignments(homeMatches);

let errorCount = 0;

for (let match of homeMatches) {
  const scorer = match[SCORER_TEAM];
  if (!scorer) {
    errorCount++;
    console.log(`no scorer for match`);
    console.table([match]);
    continue;
  }
  if (!canScoreMatch(match, scorer, allMatches)) {
    errorCount++;
  }
}

logAssignmentLength(assignments);

if (errorCount > 0) {
  console.error(`There are ${errorCount} errors in the schedule`);
} else {
  console.log('The schedule is valid');
}
