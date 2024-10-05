import { logScorers } from '../utils/log.mjs';

import { addScorerStats, getCandidates } from './scorers.mjs';

export function logUnassignedScorers(assignedMatches) {
  const candidates = getCandidates(assignedMatches);
  addScorerStats(candidates, assignedMatches);

  logScorers(candidates, { numScoredMatches: true });
}
