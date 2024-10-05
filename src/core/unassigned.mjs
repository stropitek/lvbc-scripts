import { groupBy } from 'lodash-es';

import { CLUBDESK_UID, SCORER_ID } from '../utils/constants.mjs';
import { logScorers } from '../utils/log.mjs';

import { getCandidates } from './scorers.mjs';

export function logUnassignedScorers(assignedMatches) {
  const candidates = getCandidates(assignedMatches);
  const matchByScorer = groupBy(assignedMatches, SCORER_ID);
  for (let candidate of candidates) {
    candidate.numScoredMatches =
      matchByScorer[candidate[CLUBDESK_UID]]?.length ?? 0;
  }
  logScorers(candidates, { numScoredMatches: true });
}
