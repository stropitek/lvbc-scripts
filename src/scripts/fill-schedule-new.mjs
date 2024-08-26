import { loadMatches } from '../core/matches.mjs';
import { getCandidates, getScorerFullName } from '../core/scorers.mjs';
import {
  MATCH_ID,
  PHONE_CLUBDESK,
  SCORER_1,
  SCORER_MANAGER,
  SCORER_PHONE_1,
} from '../utils/constants.mjs';
import { writeXlsx } from '../utils/xlsx.mjs';

import { canScoreMatch } from './2024/checks.mjs';
import { assignedFile, preassignedFile } from './2024/params.mjs';

// Load all matches so that we can check if a player has a conflict
const assignedMatches = await loadMatches(preassignedFile);

console.log(
  assignedMatches.reduce(
    (acc, match) => (match[SCORER_MANAGER] ? acc + 1 : acc),
    0,
  ),
  'matches already assigned',
);

mainLoop: for (let match of assignedMatches) {
  const candidates = getCandidates(assignedMatches);
  if (match[SCORER_MANAGER]) {
    continue;
  }
  for (let candidate of candidates) {
    if (canScoreMatch(candidate, match)) {
      match[SCORER_MANAGER] = getScorerFullName(candidate);
      match[SCORER_1] = match[SCORER_MANAGER];
      match[SCORER_PHONE_1] = candidate[PHONE_CLUBDESK];
      continue mainLoop;
    }
  }
  console.log(`No candidate found for match ${match[MATCH_ID]}`);
}

await writeXlsx(assignedMatches, assignedFile);
