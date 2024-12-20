import assert from 'assert';
import process from 'process';

import chalk from 'chalk';
import { groupBy } from 'lodash-es';

import {
  clubdeskPlayersFile,
  MAX_ASSIGNMENTS,
  year,
} from '../scripts/2024/params.mjs';
import {
  CLUBDESK_BIRTH_YEAR,
  CLUBDESK_FIELDS,
  CLUBDESK_FIRST_NAME,
  CLUBDESK_LAST_NAME,
  CLUBDESK_LEAGUE,
  CLUBDESK_UID,
  minScorerAge,
  SCORER_ID,
} from '../utils/constants.mjs';
import { loadCSV, writeCSV } from '../utils/csv.mjs';
import { debugFile } from '../utils/debug.mjs';
import { logMatches, logScorers } from '../utils/log.mjs';

import { getAvailabilityScore } from './checks.mjs';

const clubdeskPlayers = await loadClubdeskPlayers();
const clubdeskScorers = await loadClubdeskScorers();
const shuffledScorers = clubdeskScorers.slice().sort(() => Math.random() - 0.5);

/**
 *
 * @param {*} assignedMatches A list of matches, some of which are already assigned to a scorer.
 * @param {*} matchToScore The match for which we want to find a scorer. Used to prioritize scorers based on their availability.
 * @returns A list of scorers in order of priority, first based on the number of matches scored, then on their availability for the match.
 */
export function getCandidates(assignedMatches, matchToScore) {
  const matchByScorer = groupBy(assignedMatches, SCORER_ID);
  delete matchByScorer.undefined;
  delete matchByScorer[''];
  const candidates = shuffledScorers.slice().filter((candidate) => {
    return (
      (matchByScorer[candidate[CLUBDESK_UID]]?.length ?? 0) < MAX_ASSIGNMENTS
    );
  });

  if (matchToScore) {
    candidates.sort((scorer1, scorer2) => {
      const score1 = getAvailabilityScore(scorer1, matchToScore).score;
      const score2 = getAvailabilityScore(scorer2, matchToScore).score;
      return score2 - score1;
    });
  }

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

export function getScorerFullName(scorer, { omitLeague } = {}) {
  assert(scorer, 'scorer must be defined');
  let scorerData = scorer;
  if (typeof scorer === 'number') {
    scorerData = clubdeskPlayers.find(
      (player) => player[CLUBDESK_UID] === scorer,
    );
    assert(scorerData, 'Could not find scorer data');
  }

  return `${scorerData[CLUBDESK_FIRST_NAME]} ${scorerData[CLUBDESK_LAST_NAME]}${omitLeague ? '' : ` (${scorerData[CLUBDESK_LEAGUE]})`}`;
}

async function loadClubdeskPlayers() {
  const result = await loadCSV(clubdeskPlayersFile);
  const playerSet = new Set(result.map((r) => r[CLUBDESK_UID]));

  const uniquePlayers = Array.from(playerSet).map((uid) => {
    return result.find((row) => row[CLUBDESK_UID] === uid);
  });

  for (let player of uniquePlayers) {
    const id = normalizeScorerId(player[CLUBDESK_UID]);
    assert(id !== undefined, 'Expected ID column in clubdesk export');
    player[CLUBDESK_UID] = id;
    for (let field of CLUBDESK_FIELDS) {
      assert(
        player[field] !== undefined,
        `Clubdesk export is missing field: ${field}`,
      );
    }
  }
  return uniquePlayers;
}

export async function loadClubdeskScorers(options = {}) {
  const { loadExempted = false } = options;
  const scorerCriterium = loadExempted
    ? (row) =>
        row.Marqueur === 'Marqueur' || row.Marqueur === 'Marqueur dispensé'
    : (row) => {
        const age = year + 1 - Number(row[CLUBDESK_BIRTH_YEAR]);
        return row.Marqueur === 'Marqueur' && age >= minScorerAge;
      };
  try {
    const players = await loadClubdeskPlayers();

    const scorers = players.filter((row) => {
      // Avoid duplicates by not including the "Arbitre" role
      return scorerCriterium(row) && row[CLUBDESK_LEAGUE] !== 'Arbitre';
    });

    if (process.env.DEBUG) {
      await writeCSV(scorers, await debugFile('clubdesk-scorers.csv'));
    }
    return scorers;
  } catch (err) {
    console.error('error', err);
  }
}

export function normalizeScorerId(scorerId) {
  if (scorerId === undefined) {
    return scorerId;
  }
  const id = Number(scorerId);
  if (Number.isNaN(id) || !Number.isInteger(id)) {
    throw new Error(`Invalid scorer ID: ${scorerId}`);
  }
  return id;
}

export function addScorerStats(scorers, assignedMatches) {
  const matchByScorer = groupBy(assignedMatches, SCORER_ID);
  for (let scorer of scorers) {
    scorer.numScoredMatches = matchByScorer[scorer[CLUBDESK_UID]]?.length ?? 0;
  }
}

export function addAvailabilityScore(scorers, match) {
  for (let scorer of scorers) {
    scorer.availability = getAvailabilityScore(scorer, match);
  }
}

export function showAvailableScorers(match, assignedMatches) {
  let candidates = getCandidates(assignedMatches, match);
  addAvailabilityScore(candidates, match);
  candidates = candidates.filter(
    (candidate) => candidate.availability.score > 0,
  );
  addScorerStats(candidates, assignedMatches);
  if (candidates.length > 0) {
    console.log(chalk.green('There are candidates for this match:'));
    logMatches([match]);
    logScorers(candidates, { numScoredMatches: true, availability: true });
  } else {
    console.log(chalk.red('There are no candidates for this match'));
  }
}

export function showUnassignedScorers(assignedMatches) {
  const candidates = getCandidates(assignedMatches);
  addScorerStats(candidates, assignedMatches);

  logScorers(candidates, { numScoredMatches: true });
}

export function formatPhoneNumber(phoneNumber) {
  if (typeof phoneNumber === 'string') {
    let formatted = phoneNumber.replaceAll(' ', '');
    if (formatted.match(/^\+\d{11}/)) {
      return `${formatted.slice(0, 3)} ${formatted.slice(3, 5)} ${formatted.slice(5, 8)} ${formatted.slice(8, 10)} ${formatted.slice(10, 12)}`;
    }
  }
  return phoneNumber;
}
