import { getScorerFullName } from '../core/scorers.mjs';

import {
  DATE,
  MATCH_ID,
  SCORER_ID,
  SCORER_TEAM,
  TEAM_AWAY,
  TEAM_HOME,
} from './constants.mjs';
import { dateToString } from './date.mjs';

export function logConflict(matchToAssign, otherMatch) {
  console.table({ matchToAssign, otherMatch });
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
      ID: match[MATCH_ID],
      Day: match[DATE].getDay(),
      Date: match[DATE],
      'Home team': match[TEAM_HOME],
      'Away team': match[TEAM_AWAY],
      Scorer: match[SCORER_ID]
        ? getScorerFullName(match[SCORER_ID])
        : undefined,
    };
    if (options.availabilityScore) {
      list['Availability score'] = match.availability.score;
      list['Availability reason'] = match.availability.reason;
    }
    if (options.homeTeam) {
      list['Home team'] = match[TEAM_HOME];
    }
    if (options.awayTeam) {
      list['Away team'] = match[TEAM_AWAY];
    }
    if (options.matchId) {
      list['Match ID'] = match[MATCH_ID];
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
