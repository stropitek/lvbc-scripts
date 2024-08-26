import { groupBy } from 'lodash-es';

import { playersFile } from '../scripts/2024/params.mjs';
import {
  FIRST_NAME_CLUBDESK,
  LAST_NAME_CLUBDESK,
  LEAGUE_CLUBDESK,
  SCORER_MANAGER,
} from '../utils/constants.mjs';
import { loadCSV } from '../utils/csv.mjs';

const allScorers = await loadCSV(playersFile);

export function getCandidates(assignedMatches) {
  const assignedByManager = groupBy(assignedMatches, SCORER_MANAGER);
  const candidates = allScorers.slice();
  candidates.sort(
    (scorer1, scorer2) =>
      (assignedByManager[getScorerFullName(scorer1)]?.length ?? 0) -
      (assignedByManager[getScorerFullName(scorer2)]?.length ?? 0),
  );

  return candidates;
}

/**
 *
 * @param {*} scorers List of clubdesk scorers
 */
export function createScorerPairs(scorers) {
  const scorerGroups = groupBy(scorers, LEAGUE_CLUBDESK);
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
  return `${scorer[FIRST_NAME_CLUBDESK]} ${scorer[LAST_NAME_CLUBDESK]}`;
}
