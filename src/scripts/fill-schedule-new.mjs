import { loadMatches } from '../core/matches.mjs';
import { getCandidates, getScorerFullName } from '../core/scorers.mjs';
import {
  MATCH_ID,
  CLUBDESK_PHONE,
  SCORER_1,
  SCORER_PHONE_1,
  SCORER_ID,
  CLUBDESK_UID,
  DATE,
} from '../utils/constants.mjs';
import { writeXlsx } from '../utils/xlsx.mjs';

import { canScoreMatch, assertTrainingSchedule } from './2024/checks.mjs';
import {
  assignedFile,
  ASSIGNMENT_CUTOFF,
  preassignedFile,
} from './2024/params.mjs';

assertTrainingSchedule();
// Load all matches so that we can check if a player has a conflict
const assignedMatches = await loadMatches(preassignedFile);

let afterCutOffCount = 0;
let conflictCount = 0;
let assignedCount = 0;
let alreadyAssignedCount = 0;
let total = assignedMatches.length;
let noCandidatesCount = 0;
mainLoop: for (let match of assignedMatches) {
  if (isAfterCutoff(match)) {
    afterCutOffCount++;
    continue;
  }
  if (isAssigned(match)) {
    alreadyAssignedCount++;
    continue;
  }
  const candidates = getCandidates(assignedMatches);

  if (candidates.length === 0) {
    noCandidatesCount++;
    continue;
  }
  for (let candidate of candidates) {
    if (canScoreMatch(candidate, match)) {
      match[SCORER_ID] = candidate[CLUBDESK_UID];
      match[SCORER_1] = getScorerFullName(candidate);
      match[SCORER_PHONE_1] = candidate[CLUBDESK_PHONE];
      assignedCount++;
      continue mainLoop;
    }
  }
  conflictCount++;
  console.log(`No candidate found for match ${match[MATCH_ID]}`);
}

await writeXlsx(assignedMatches, assignedFile);

console.log(`
  Total:            ${total}
  Assigned:         ${assignedCount}
  Conflict:         ${conflictCount}
  No candidates:    ${noCandidatesCount}
  After cutoff:     ${afterCutOffCount}
  Already assigned: ${alreadyAssignedCount}
  `);

function isAfterCutoff(match) {
  if (match[DATE] > ASSIGNMENT_CUTOFF) {
    return true;
  }
  return false;
}

function isAssigned(match) {
  if (match[SCORER_ID]) {
    return true;
  }
  return false;
}
