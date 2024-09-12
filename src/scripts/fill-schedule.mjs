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

import {
  assertTrainingSchedule,
  getAvailabilityScore,
} from './2024/checks.mjs';
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
for (let matchToScore of assignedMatches) {
  if (isAfterCutoff(matchToScore)) {
    afterCutOffCount++;
    continue;
  }
  if (isAssigned(matchToScore)) {
    alreadyAssignedCount++;
    continue;
  }
  const candidates = getCandidates(assignedMatches, matchToScore);

  const bestCandidate = candidates[0];
  if (!bestCandidate) {
    // No more candidates left
    noCandidatesCount++;
    continue;
  }

  const availability = getAvailabilityScore(bestCandidate, matchToScore);
  if (availability.score === 0) {
    conflictCount++;
    console.log(`No candidate found for match ${matchToScore[MATCH_ID]}`);
  } else {
    matchToScore[SCORER_ID] = bestCandidate[CLUBDESK_UID];
    matchToScore[SCORER_1] = getScorerFullName(bestCandidate);
    matchToScore[SCORER_PHONE_1] = bestCandidate[CLUBDESK_PHONE];
    assignedCount++;
  }
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
