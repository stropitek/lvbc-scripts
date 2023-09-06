import { filterHomeMatches, loadMatches } from '../core/matches.mjs';
import { SCORER_TEAM } from '../utils/constants.mjs';

import { canScoreMatch } from './2023/checks.mjs';
import { tunedInputFile } from './2023/params.mjs';

const matches = await loadMatches(tunedInputFile);
const homeMatches = filterHomeMatches(matches);
let errorCount = 0;

for (let match of homeMatches) {
  const scorer = match[SCORER_TEAM];
  if (!scorer) {
    errorCount++;
    console.log(`no scorer for match`);
    console.table([match]);
    continue;
  }
  if (!canScoreMatch(match, scorer, matches)) {
    errorCount++;
  }
}

if (errorCount > 0) {
  console.error(`There are ${errorCount} errors in the schedule`);
} else {
  console.log('The schedule is valid');
}
