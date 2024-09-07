import { groupBy } from 'lodash-es';

import { MAX_ASSIGNMENTS, playersFile } from '../scripts/2024/params.mjs';
import {
  CLUBDESK_FIRST_NAME,
  CLUBDESK_LAST_NAME,
  CLUBDESK_LEAGUE,
  CLUBDESK_UID,
  SCORER_ID,
} from '../utils/constants.mjs';
import { loadCSV } from '../utils/csv.mjs';

const allScorers = await loadCSV(playersFile);

export function getCandidates(assignedMatches) {
  const matchByScorer = groupBy(assignedMatches, SCORER_ID);
  delete matchByScorer.undefined;
  delete matchByScorer[''];
  const candidates = allScorers.slice().filter((candidate) => {
    return (
      (matchByScorer[candidate[CLUBDESK_UID]]?.length ?? 0) < MAX_ASSIGNMENTS
    );
  });
  candidates.sort(
    (scorer1, scorer2) =>
      (matchByScorer[scorer1[CLUBDESK_UID]]?.length ?? 0) -
      (matchByScorer[scorer2[CLUBDESK_UID]]?.length ?? 0),
  );

  return candidates;
}

/**
 *
 * @param {*} scorers List of clubdesk scorers
 */
export function createScorerPairs(scorers) {
  const scorerGroups = groupBy(scorers, CLUBDESK_LEAGUE);
  const pairs = [];
  for (let [key, scorers] of Object.entries(scorerGroups)) {
    if (scorers.length < 2) {
      throw new Error(`Not enough scorers for team ${key}`);
    }
    if (scorers.length % 2 === 0) {
      pairs.push(...createPairsBy2(scorers));
    } else {
      pairs.push(...createPairsBy2(scorers.slice(0, -3)));
      pairs.push(...createPairsBy3(scorers.slice(-3)));
    }
  }
  return pairs;
}

function createPairsBy2(scorers) {
  const pairs = [];
  for (let i = 0; i < scorers.length; i += 2) {
    pairs.push([scorers[i], scorers[i + 1]], [scorers[i + 1], scorers[i]]);
  }
  return pairs;
}

function createPairsBy3(scorers) {
  const pairs = [];
  for (let i = 0; i < scorers.length; i += 3) {
    pairs.push(
      [scorers[i], scorers[i + 1]],
      [scorers[i + 1], scorers[i + 2], [scorers[i + 2], scorers[i]]],
    );
  }
  return pairs;
}

export function getScorerFullName(scorer) {
  return `${scorer[CLUBDESK_FIRST_NAME]} ${scorer[CLUBDESK_LAST_NAME]} (${scorer[CLUBDESK_LEAGUE]})`;
}
