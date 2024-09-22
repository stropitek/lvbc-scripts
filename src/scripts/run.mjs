import chalk from 'chalk';

import { checkScoredMatches, loadScoredMatches } from '../core/matches.mjs';
import { getCandidates, getScorerFullName } from '../core/scorers.mjs';
import {
  CLUBDESK_PHONE,
  SCORER_1,
  SCORER_PHONE_1,
  SCORER_ID,
  CLUBDESK_UID,
  DATE,
  PUBLIC_MATCH_FIELDS,
} from '../utils/constants.mjs';
import { enquireAssignmentSheet } from '../utils/enquirer.mjs';
import { writeXlsx } from '../utils/xlsx.mjs';

import {
  assertTrainingSchedule,
  getAvailabilityScore,
} from './2024/checks.mjs';
import { assignedFile, ASSIGNMENT_CUTOFF } from './2024/params.mjs';

assertTrainingSchedule();
const file = await enquireAssignmentSheet();
// Load all matches so that we can check if a player has a conflict
const assignedMatches = await loadScoredMatches(file);

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
  } else {
    matchToScore[SCORER_ID] = bestCandidate[CLUBDESK_UID];
    matchToScore[SCORER_1] = getScorerFullName(bestCandidate);
    matchToScore[SCORER_PHONE_1] = bestCandidate[CLUBDESK_PHONE];
    assignedCount++;
  }
}

await writeXlsx(
  assignedMatches,
  assignedFile,
  'Marquages',
  PUBLIC_MATCH_FIELDS,
);

console.log(
  chalk.blue(`
  Total:            ${total}
  Assigned:         ${assignedCount}
  Conflict:         ${conflictCount}
  No candidates:    ${noCandidatesCount}
  After cutoff:     ${afterCutOffCount}
  Already assigned: ${alreadyAssignedCount}
  `),
);

await checkScoredMatches(assignedMatches);

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
