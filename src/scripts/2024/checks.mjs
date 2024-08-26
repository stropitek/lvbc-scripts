import process from 'process';

import { loadVBManagerMatches } from '../../core/matches.mjs';
import { translateLeagueToClubdesk } from '../../utils/clubdesk.mjs';
import {
  DATE,
  LEAGUE_CLUBDESK,
  MATCH_ID,
  SCORER_TEAM,
  TEAM_AWAY,
  TEAM_HOME,
} from '../../utils/constants.mjs';
import { dateToString, isSameDay } from '../../utils/date.mjs';
import { logConflict } from '../../utils/log.mjs';

import { trainingSchedule } from './params.mjs';

const VBMMatches = await loadVBManagerMatches();

export function findConflictLegacy(match, team, allMatches) {
  const teamMatches = allMatches.filter(
    (match) => match[TEAM_AWAY] === team || match[TEAM_HOME] === team,
  );
  const conflictingMatch = teamMatches.find((teamMatch) =>
    isSameDay(teamMatch[DATE], match[DATE]),
  );
  if (conflictingMatch) {
    if (process.env.DEBUG) {
      console.log(`${team} has a conflict`);
      logConflict(match, conflictingMatch);
    }
  }
  return teamMatches.find((teamMatch) =>
    isSameDay(teamMatch[DATE], match[DATE]),
  );
}

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
  const league = scorer[LEAGUE_CLUBDESK];

  return VBMMatches.filter(
    (match) => translateLeagueToClubdesk(match) === league,
  ).some((teamMatch) => isSameDay(teamMatch[DATE], match[DATE]));
}

export function hasTraining(match, team) {
  const day = match[DATE].getDay();
  const hours = trainingSchedule[team];

  if (!hours) {
    throw new Error(`Missing training schedule for team ${team}`);
  }

  if (hours.includes(day)) {
    if (process.env.DEBUG) {
      console.log(`${team} has training on ${day}`);
    }
    return true;
  }
  return false;
}

export function canScoreMatch(scorer, match) {
  const league = translateLeagueToClubdesk(match);
  const scorerLeague = scorer[LEAGUE_CLUBDESK];

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
