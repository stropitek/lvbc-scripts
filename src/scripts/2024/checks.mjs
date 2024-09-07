import assert from 'assert';
import process from 'process';

import { loadVBManagerMatches } from '../../core/matches.mjs';
import { translateLeagueToClubdesk } from '../../utils/clubdesk.mjs';
import {
  DATE,
  CLUBDESK_LEAGUE,
  MATCH_ID,
  SCORER_TEAM,
  TEAM_AWAY,
  TEAM_HOME,
} from '../../utils/constants.mjs';
import { dateToString, isSameDay } from '../../utils/date.mjs';
import { logConflict } from '../../utils/log.mjs';

import {
  MAX_MATCH_AFTER_TRAINING_MINUTES,
  MIN_MATCH_BEFORE_TRAINING_MINUTES,
  trainingSchedule,
} from './params.mjs';

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

const VBMMatches = await loadVBManagerMatches();

export function logMatchDateChange(originalAndNew) {
  const list = originalAndNew.map(({ newMatch, match }) => {
    return {
      'Match ID': match[MATCH_ID],
      'Home team': match[TEAM_HOME],
      'Away team': match[TEAM_AWAY],
      'Original date': dateToString(match[DATE]),
      'New date': dateToString(newMatch[DATE]),
    };
  });
  console.table(list);
}

export function logMatches(matches, options = {}) {
  const simplified = matches.map((match) => {
    const list = {
      Day: match[DATE].getDay(),
      Date: match[DATE],
      // 'Home team': match[TEAM_HOME],
      // 'Away team': match[TEAM_AWAY],
      'Scorer team': match[SCORER_TEAM],
    };
    if (options.homeTeam) {
      list['Home team'] = match[TEAM_HOME];
    }
    if (options.awayTeam) {
      list['Away team'] = match[TEAM_AWAY];
    }
    return list;
  });
  console.table(simplified);
}

export function logMatchConflicts(conflicts) {
  const simplified = conflicts.map(([original, conflicting]) => {
    return {
      Day: original[DATE].getDay(),
      Date: original[DATE],
      'Scorer team': original[SCORER_TEAM],
      'Home team 1':
        original[TEAM_HOME] === original[SCORER_TEAM]
          ? 'scorer'
          : original[TEAM_HOME],
      'Away team 1':
        original[TEAM_AWAY] === original[SCORER_TEAM]
          ? 'scorer'
          : original[TEAM_AWAY],
      Conflicting: conflicting[DATE],
      'Home team 2':
        conflicting[TEAM_HOME] === original[SCORER_TEAM]
          ? 'scorer'
          : conflicting[TEAM_HOME],
      'Away team 2':
        conflicting[TEAM_AWAY] === original[SCORER_TEAM]
          ? 'scorer'
          : conflicting[TEAM_AWAY],
    };
  });
  console.table(simplified);
}

export function hasConflict(match, scorer) {
  const league = scorer[CLUBDESK_LEAGUE];

  return VBMMatches.filter(
    (match) => translateLeagueToClubdesk(match) === league,
  ).some((teamMatch) => isSameDay(teamMatch[DATE], match[DATE]));
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
        if (process.env.DEBUG) {
          console.log(`${team} has training on ${matchDay}`);
        }
        return true;
      }
    }
  }

  return false;
}

export function canScoreMatch(scorer, match) {
  const league = translateLeagueToClubdesk(match);
  const scorerLeague = scorer[CLUBDESK_LEAGUE];

  if (league === scorerLeague) {
    return false;
  }

  if (hasTraining(match, scorerLeague)) {
    return false;
  }

  if (hasConflict(match, scorer)) {
    return false;
  }
  return true;
}
