import { assignScorers } from '../core/assign.mjs';
import { assertTrainingSchedule } from '../core/checks.mjs';
import {
  checkScoredMatches,
  loadScoredMatches,
  showAvailableMatches,
} from '../core/matches.mjs';
import {
  showAvailableScorers,
  showUnassignedScorers,
} from '../core/scorers.mjs';
import {
  DATE,
  TASK_ASSIGN,
  TASK_CHECK,
  TASK_FIND_MATCH,
  TASK_FIND_SCORER,
  TASK_UNASSIGNED,
} from '../utils/constants.mjs';
import {
  enquireAssignmentSheet,
  enquireMatch,
  enquireRunTask,
  enquireScorer,
} from '../utils/enquirer.mjs';

assertTrainingSchedule();
const file = await enquireAssignmentSheet();
// Load all matches so that we can check if a player has a conflict
const assignedMatches = await loadScoredMatches(file);

const task = await enquireRunTask();

switch (task) {
  case TASK_ASSIGN:
    await assignScorers(assignedMatches);
    break;
  case TASK_CHECK:
    await checkScoredMatches(assignedMatches);
    break;
  case TASK_UNASSIGNED:
    showUnassignedScorers(assignedMatches);
    break;
  case TASK_FIND_SCORER: {
    const futureMatches = assignedMatches.filter(
      (assignedMatch) => assignedMatch[DATE] >= Date.now(),
    );
    const match = await enquireMatch(futureMatches);
    showAvailableScorers(match, assignedMatches);
    break;
  }
  case TASK_FIND_MATCH: {
    const scorer = await enquireScorer();
    showAvailableMatches(scorer, assignedMatches);
    break;
  }
  default:
    throw new Error('Unknown task');
}
