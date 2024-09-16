import process from 'process';

import { groupBy } from 'lodash-es';

import { getAvailabilityScore } from '../scripts/2024/checks.mjs';
import {
  clubdeskPlayersFile,
  MAX_ASSIGNMENTS,
  year,
} from '../scripts/2024/params.mjs';
import {
  CLUBDESK_BIRTH_YEAR,
  CLUBDESK_FIRST_NAME,
  CLUBDESK_LAST_NAME,
  CLUBDESK_LEAGUE,
  CLUBDESK_UID,
  minScorerAge,
  SCORER_ID,
} from '../utils/constants.mjs';
import { loadCSV, writeCSV } from '../utils/csv.mjs';
import { debugFile } from '../utils/debug.mjs';

const clubdeskScorers = await loadClubdeskScorers();
const shuffledScorers = clubdeskScorers.slice().sort(() => Math.random() - 0.5);

export function getCandidates(assignedMatches, matchToScore) {
  const matchByScorer = groupBy(assignedMatches, SCORER_ID);
  delete matchByScorer.undefined;
  delete matchByScorer[''];
  const candidates = shuffledScorers.slice().filter((candidate) => {
    return (
      (matchByScorer[candidate[CLUBDESK_UID]]?.length ?? 0) < MAX_ASSIGNMENTS
    );
  });

  candidates.sort((scorer1, scorer2) => {
    const score1 = getAvailabilityScore(scorer1, matchToScore).score;
    const score2 = getAvailabilityScore(scorer2, matchToScore).score;
    return score2 - score1;
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
  let scorerData = scorer;
  if (typeof scorer === 'string') {
    scorerData = clubdeskScorers.find(
      (player) => player[CLUBDESK_UID] === scorer,
    );
  }
  return `${scorerData[CLUBDESK_FIRST_NAME]} ${scorerData[CLUBDESK_LAST_NAME]} (${scorerData[CLUBDESK_LEAGUE]})`;
}

export async function loadClubdeskScorers() {
  try {
    const result = await loadCSV(clubdeskPlayersFile);

    const playerSet = new Set(result.map((r) => r[CLUBDESK_UID]));
    const uniquePlayers = Array.from(playerSet).map((uid) => {
      return result.find((row) => row[CLUBDESK_UID] === uid);
    });

    const players = uniquePlayers.filter((row) => {
      const age = year - Number(row[CLUBDESK_BIRTH_YEAR]);
      return (
        row.Marqueur === 'Marqueur' &&
        row[CLUBDESK_LEAGUE] !== 'Arbitre' &&
        age >= minScorerAge
      );
    });

    if (process.env.DEBUG) {
      await writeCSV(players, await debugFile('clubdesk-scorers.csv'));
    }
    return players;
  } catch (err) {
    console.error('error', err);
  }
}
