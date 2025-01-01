import { parseArgs } from 'node:util';

import { assignScorers } from '../core/assign.mjs';
import { assertTrainingSchedule } from '../core/checks.mjs';
import {
  checkScoredMatches,
  loadScoredMatches,
  showAvailableMatches,
} from '../core/matches.mjs';
import {
  printScorerList,
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
  TASK_PRINT_SCORERS,
} from '../utils/constants.mjs';
import {
  enquireAssignmentSheet,
  enquireMatch,
  enquirePrintScorerType,
  enquireRunTask,
  enquireScorer,
} from '../utils/enquirer.mjs';

import { sharedGoogleSheetFile } from './2024/params.mjs';

const args = parseArgs({
  options: {
    interactive: {
      type: 'boolean',
      short: 'i',
    },
  },
});

assertTrainingSchedule();

const file = args.values.interactive
  ? await enquireAssignmentSheet()
  : sharedGoogleSheetFile;
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
  case TASK_PRINT_SCORERS: {
    const printType = await enquirePrintScorerType();
    await printScorerList({ showAll: printType === 'All' });
    break;
  }
  default:
    throw new Error('Unknown task');
}
