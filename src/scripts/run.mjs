import { assignScorers } from '../core/assign.mjs';
import { assertTrainingSchedule } from '../core/checks.mjs';
import { checkScoredMatches, loadScoredMatches } from '../core/matches.mjs';
import {
  showAvailableScorers,
  showUnassignedScorers,
} from '../core/scorers.mjs';
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
  showUnassignedScorers(assignedMatches);
} else if (task === TASK_FIND_SCORER) {
  const futureMatches = assignedMatches.filter(
    (assignedMatch) => assignedMatch[DATE] >= Date.now(),
  );
  const match = await enquireMatch(futureMatches);
  showAvailableScorers(match, assignedMatches);
} else {
  throw new Error('Unknown task');
}
