import assert from 'assert';

import {
  MAX_MATCH_AFTER_TRAINING_MINUTES,
  MIN_MATCH_BEFORE_TRAINING_MINUTES,
  trainingSchedule,
  TRAINING_CONFLICT_SCORE,
  BASELINE_SCORE,
  POSITIVE_MATCH_CONFLICT_SCORE,
  IS_NEW_SCORER_SCORE,
} from '../scripts/2024/params.mjs';
import { translateLeagueToClubdesk } from '../utils/clubdesk.mjs';
import {
  CLUBDESK_GROUPS,
  CLUBDESK_SCORER_ROLE,
  DATE,
  LOCATION,
  SCORER_1,
} from '../utils/constants.mjs';
import { isSameDay } from '../utils/date.mjs';

import { loadVbmMatches } from './matches.mjs';
import { getLeagues, getScorerFullName, getScorerId } from './scorers.mjs';

const hourRegex = /^\d{2}:\d{2}$/;

export function assertTrainingSchedule() {
  for (let [team, schedule] of Object.entries(trainingSchedule)) {
    for (let [day, timeStart, timeEnd] of schedule) {
      if (!Number.isInteger(day) || day < 0 || day > 6) {
        throw new Error(
          'Invalid day in training schedule, should be an interger between 0 and 6',
        );
      }
      if (!hourRegex.test(timeStart) || !hourRegex.test(timeEnd)) {
        throw new Error(
          `Invalid hour format in training schedule for team ${team}`,
        );
      }
    }
  }
}

const VBMMatches = await loadVbmMatches();

function findSameDayMatch(match, scorer) {
  const leagues = getLeagues(scorer);
  return VBMMatches.filter((match) =>
    leagues.includes(translateLeagueToClubdesk(match)),
  ).find((teamMatch) => {
    return isSameDay(teamMatch[DATE], match[DATE]);
  });
}

export function hasConflict(match, scorer) {
  const sameDayMatch = findSameDayMatch(match, scorer);
  return sameDayMatch
    ? getMatchConflictScore(sameDayMatch, match) === 0
    : false;
}

export function findConflict(match, scorer) {
  const sameDayMatch = findSameDayMatch(match, scorer);
  if (sameDayMatch) {
    return getMatchConflictScore(sameDayMatch, match).score === 0
      ? sameDayMatch
      : undefined;
  }
  return undefined;
}

export function hasTraining(match, scorer) {
  const matchDay = match[DATE].getDay();
  const scorerLeagues = getLeagues(scorer);

  const schedule = scorerLeagues
    .map((league) => trainingSchedule[league] || [])
    .flat();

  assert(
    schedule.length > 0,
    `Missing training schedule for scorer with groups ${scorer[CLUBDESK_GROUPS]}`,
  );

  for (let [day, timeStart, timeEnd] of schedule) {
    if (matchDay === day) {
      const hourStart = Number(timeStart.slice(0, 2));
      const minuteStart = Number(timeStart.slice(3));
      const hourEnd = Number(timeEnd.slice(0, 2));
      const minuteEnd = Number(timeEnd.slice(3));
      const trainingDateStart = new Date(match[DATE]);
      trainingDateStart.setHours(hourStart, minuteStart);
      const trainingDateEnd = new Date(match[DATE]);
      trainingDateEnd.setHours(hourEnd, minuteEnd);
      if (match[DATE] > trainingDateEnd) {
        const diff = match[DATE].getTime() - trainingDateEnd.getTime();
        if (diff <= MAX_MATCH_AFTER_TRAINING_MINUTES * 60 * 1000) {
          // Close to training end
          return false;
        }
      } else if (match[DATE] < trainingDateStart) {
        const diff = trainingDateStart.getTime() - match[DATE].getTime();
        if (diff >= MIN_MATCH_BEFORE_TRAINING_MINUTES * 60 * 1000) {
          // Can score after match
          return false;
        }
      } else {
        // Training conflict
        return true;
      }
    }
  }

  return false;
}

function getMatchConflictScore(match1, match2) {
  assert(isSameDay(match1[DATE], match2[DATE]));
  return match1[LOCATION] === match2[LOCATION]
    ? {
        score: POSITIVE_MATCH_CONFLICT_SCORE,
        reason: 'Ideal: match and score the same day',
      }
    : {
        score: 0,
        reason: 'Hard conflict: Has a match at the same time',
      };
}

// Returns
// 0 if not available to score
// A higher score for the most favorable availability
export function getAvailabilityScore(scorer, match) {
  const scores = [];
  const league = translateLeagueToClubdesk(match);
  const leagues = getLeagues(scorer);

  if (leagues.includes(league)) {
    // Cannot play and score the same match
    scores.push({
      score: 0,
      reason: 'Hard conflict: Cannot play and score the same match',
    });
  }

  if (hasTraining(match, scorer)) {
    scores.push({
      score: TRAINING_CONFLICT_SCORE,
      reason: 'Soft conflict: Training',
    });
  }

  const conflictingMatch = findSameDayMatch(match, scorer);
  if (conflictingMatch) {
    scores.push(getMatchConflictScore(match, conflictingMatch));
  }

  if (scorer[CLUBDESK_SCORER_ROLE] === 'Nouveau marqueur') {
    scores.push({
      score: IS_NEW_SCORER_SCORE,
      reason: 'New scorer with baseline availability',
    });
  }
  scores.sort((score1, score2) => score1.score - score2.score);
  return scores.length === 0
    ? { score: BASELINE_SCORE, reason: 'Regular: no conflict' }
    : scores[0];
}

/**
 *
 * @param {*} match from google spreadsheet
 * @returns {string | null} error message if there is a mismatch, null otherwise
 */
export function getNameMismatchError(match) {
  const scorerId = getScorerId(match);
  if (scorerId) {
    const scorerName = getScorerFullName(scorerId, {
      omitLeague: true,
    });
    if (!match[SCORER_1]) {
      return 'UID present but name missing';
    }
    if (!match[SCORER_1].toLowerCase().startsWith(scorerName.toLowerCase())) {
      return `Name mismatch, expected ${scorerName}, got ${match[SCORER_1]}`;
    }
  } else if (match[SCORER_1]) {
    return 'Name present but no UID';
  }
  return null;
}
