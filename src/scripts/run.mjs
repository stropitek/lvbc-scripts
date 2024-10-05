import { assignScorers } from '../core/assign.mjs';
import { assertTrainingSchedule } from '../core/checks.mjs';
import { checkScoredMatches, loadScoredMatches } from '../core/matches.mjs';
import { logUnassignedScorers } from '../core/unassigned.mjs';
import {
  TASK_ASSIGN,
  TASK_CHECK,
  TASK_UNASSIGNED,
} from '../utils/constants.mjs';
import { enquireAssignmentSheet, enquireRunTask } from '../utils/enquirer.mjs';

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
} else {
  throw new Error('Unknown task');
}
