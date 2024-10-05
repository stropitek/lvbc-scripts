import chalk from 'chalk';

import { assignScorers } from '../core/assign.mjs';
import {
  assertTrainingSchedule,
  getAvailabilityScore,
} from '../core/checks.mjs';
import { checkScoredMatches, loadScoredMatches } from '../core/matches.mjs';
import {
  addAvailabilityScore,
  addScorerStats,
  getCandidates,
} from '../core/scorers.mjs';
import { logUnassignedScorers } from '../core/unassigned.mjs';
import {
  DATE,
  TASK_ASSIGN,
  TASK_CHECK,
  TASK_FIND_SCORER,
  TASK_UNASSIGNED,
} from '../utils/constants.mjs';
import {
  enquireAssignmentSheet,
  enquireMatch,
  enquireRunTask,
} from '../utils/enquirer.mjs';
import { logScorers } from '../utils/log.mjs';

assertTrainingSchedule();
const file = await enquireAssignmentSheet();
// Load all matches so that we can check if a player has a conflict
const assignedMatches = await loadScoredMatches(file);

const task = await enquireRunTask();

if (task === TASK_ASSIGN) {
  await assignScorers(assignedMatches);
} else if (task === TASK_CHECK) {
  await checkScoredMatches(assignedMatches);
} else if (task === TASK_UNASSIGNED) {
  logUnassignedScorers(assignedMatches);
} else if (task === TASK_FIND_SCORER) {
  const futureMatches = assignedMatches.filter(
    (assignedMatch) => assignedMatch[DATE] >= Date.now(),
  );
  const match = await enquireMatch(futureMatches);

  let candidates = getCandidates(assignedMatches, match);
  addAvailabilityScore(candidates, match);
  candidates = candidates.filter(
    (candidate) => candidate.availability.score > 0,
  );
  addScorerStats(candidates, assignedMatches);
  if (candidates.length > 0) {
    console.log(chalk.green('There are candidates for this match:'));
    logScorers(candidates, { numScoredMatches: true, availability: true });
  } else {
    console.log(chalk.red('There are no candidates for this match'));
  }
} else {
  throw new Error('Unknown task');
}
