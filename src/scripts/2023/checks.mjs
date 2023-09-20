import process from 'process';

import {
  DATE,
  SCORER_TEAM,
  TEAM_AWAY,
  TEAM_HOME,
} from '../../utils/constants.mjs';
import { isSameDay } from '../../utils/date.mjs';
import { logConflict } from '../../utils/log.mjs';

import { trainingSchedule } from './params.mjs';

export function canScoreMatch(match, team, allMatches) {
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
  return !teamMatches.some((teamMatch) =>
    isSameDay(teamMatch[DATE], match[DATE]),
  );
}

export function logMatches(matches) {
  const simplified = matches.map((match) => {
    return {
      Day: match[DATE].getDay(),
      Date: match[DATE],
      // 'Home team': match[TEAM_HOME],
      // 'Away team': match[TEAM_AWAY],
      'Scorer team': match[SCORER_TEAM],
    };
  });
  console.table(simplified);
}

export function hasTraining(match, team) {
  const day = match[DATE].getDay();
  const hours = trainingSchedule[team];

  if (hours.includes(day)) {
    if (process.env.DEBUG) {
      console.log(`${team} has training on ${day}`);
    }
    return true;
  }
  return false;
}
