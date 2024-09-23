import { assignScorers } from '../core/assign.mjs';
import { checkScoredMatches, loadScoredMatches } from '../core/matches.mjs';
import { enquireAssignmentSheet, enquireRunTask } from '../utils/enquirer.mjs';

import { assertTrainingSchedule } from './2024/checks.mjs';

assertTrainingSchedule();
const file = await enquireAssignmentSheet();
// Load all matches so that we can check if a player has a conflict
const assignedMatches = await loadScoredMatches(file);

const task = await enquireRunTask();

if (task === 'Assign') {
  await assignScorers(assignedMatches);
} else if (task === 'Check') {
  await checkScoredMatches(assignedMatches);
} else {
  throw new Error('Unknown task');
}
