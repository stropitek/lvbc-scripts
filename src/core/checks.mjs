import assert from 'assert';

import {
  MAX_MATCH_AFTER_TRAINING_MINUTES,
  MIN_MATCH_BEFORE_TRAINING_MINUTES,
  trainingSchedule,
  TRAINING_CONFLICT_SCORE,
  BASELINE_SCORE,
  POSITIVE_MATCH_CONFLICT_SCORE,
} from '../scripts/2024/params.mjs';
import { translateLeagueToClubdesk } from '../utils/clubdesk.mjs';
import {
  DATE,
  CLUBDESK_LEAGUE,
  LOCATION,
  SCORER_1,
  SCORER_ID,
} from '../utils/constants.mjs';
import { isSameDay } from '../utils/date.mjs';

import { loadVbmMatches } from './matches.mjs';
import { getScorerFullName } from './scorers.mjs';

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
  const league = scorer[CLUBDESK_LEAGUE];
  return VBMMatches.filter(
    (match) => translateLeagueToClubdesk(match) === league,
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
    return getMatchConflictScore(sameDayMatch, match) === 0
      ? sameDayMatch
      : undefined;
  }
  return undefined;
}

export function hasTraining(match, team) {
  const matchDay = match[DATE].getDay();

  const schedule = trainingSchedule[team];

  assert(schedule, `Missing training schedule for team ${team}`);

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
  const scorerLeague = scorer[CLUBDESK_LEAGUE];

  if (league === scorerLeague) {
    // Cannot play and score the same match
    scores.push({
      score: 0,
      reason: 'Hard conflict: Cannot play and score the same match',
    });
  }

  if (hasTraining(match, scorer[CLUBDESK_LEAGUE])) {
    scores.push({
      score: TRAINING_CONFLICT_SCORE,
      reason: 'Soft conflict: Training',
    });
  }

  const conflictingMatch = findSameDayMatch(match, scorer);
  if (conflictingMatch) {
    scores.push(getMatchConflictScore(match, conflictingMatch));
  }

  scores.sort((score1, score2) => score1.score - score2.score);
  return scores.length === 0
    ? { score: BASELINE_SCORE, reason: 'Regular: no conflict' }
    : scores[0];
}

export function getNameMismatchError(match) {
  console.log(match);
  if (match[SCORER_ID]) {
    const scorerName = getScorerFullName(match[SCORER_ID], {
      omitLeague: true,
    });
    if (!match[SCORER_1]) {
      return 'UID present but name missing';
    }
    if (scorerName.startsWith(match[SCORER_1])) {
      return `Name mismatch, expected ${scorerName}, got ${match[SCORER_1]}`;
    }
  } else if (match[SCORER_1]) {
    return 'Name present but no UID';
  }
  return null;
}
