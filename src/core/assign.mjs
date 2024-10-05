import process from 'process';

import chalk from 'chalk';

import { getAvailabilityScore } from './checks.mjs';
import { assignedFile, ASSIGNMENT_CUTOFF } from '../scripts/2024/params.mjs';
import {
  CLUBDESK_PHONE,
  CLUBDESK_UID,
  DATE,
  PUBLIC_MATCH_FIELDS,
  SCORER_1,
  SCORER_ID,
  SCORER_PHONE_1,
} from '../utils/constants.mjs';
import { logMatches } from '../utils/log.mjs';
import { writeXlsx } from '../utils/xlsx.mjs';

import { getCandidates, getScorerFullName } from './scorers.mjs';

export async function assignScorers(assignedMatches) {
  const newAssignements = [];
  const conflicts = [];
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
      conflicts.push(matchToScore);
      conflictCount++;
    } else {
      matchToScore[SCORER_ID] = bestCandidate[CLUBDESK_UID];
      matchToScore[SCORER_1] = getScorerFullName(bestCandidate);
      matchToScore[SCORER_PHONE_1] = bestCandidate[CLUBDESK_PHONE];
      assignedCount++;
      newAssignements.push(matchToScore);
    }
  }

  console.log('New assignements:');
  logMatches(newAssignements);

  if (conflicts.length > 0) {
    console.log('Conflicts:');
    logMatches(conflicts);
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

  return assignedMatches;
}

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
