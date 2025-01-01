import {
  findClubdeskScorer,
  formatPhoneNumber,
  getScorerFullName,
  getScorerId,
} from '../core/scorers.mjs';

import {
  CLUBDESK_PHONE,
  CLUBDESK_SCORER_ROLE,
  CLUBDESK_UID,
  DATE,
  MATCH_ID,
  SCORER_ID,
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

/**
 *
 * @param {*} matches
 * @param {{matchId?: boolean, error?: boolean, homeTeam?: boolean, awayTeam?: boolean, scorerPhone?: boolean}} options
 */
export function logMatches(matches, options = {}) {
  const simplified = matches.map((match) => {
    const list = {
      ID: match[MATCH_ID],
      Day: match[DATE].getDay(),
      Date: dateToString(match[DATE]),
      'Home team': match[TEAM_HOME],
      'Away team': match[TEAM_AWAY],
      Scorer: match[SCORER_ID]
        ? getScorerFullName(getScorerId(match), { withClubdeskId: true })
        : undefined,
    };
    if (options.scorerPhone && match[SCORER_ID]) {
      const scorerId = getScorerId(match);
      const scorer = findClubdeskScorer(scorerId);
      list['Scorer phone'] = scorer[CLUBDESK_PHONE];
    }

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
    if (options.error) {
      list.error = match.error;
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
      'Home team': original[TEAM_HOME],
      'Away team': original[TEAM_AWAY],
      'Home team (conflict)': conflicting[TEAM_HOME],
      'Away team (conflict)': conflicting[TEAM_AWAY],
    };
  });
  console.table(simplified);
}

export function logScorers(scorers, options) {
  const logTable = scorers.map((scorer) => {
    const entry = {};
    entry.ID = scorer[CLUBDESK_UID];
    entry.Name = getScorerFullName(scorer);
    if (scorer[CLUBDESK_SCORER_ROLE]) {
      entry.Marqueur = scorer[CLUBDESK_SCORER_ROLE];
    }
    entry.Phone = formatPhoneNumber(scorer[CLUBDESK_PHONE]);
    if (options?.numScoredMatches) {
      if (scorer.numScoredMatches === undefined) {
        throw new Error(
          'Expected numScoredMatches to be defined when logging scorers',
        );
      }
      entry['# scored matches'] = scorer.numScoredMatches;
    }
    if (options?.availability) {
      entry['Availability score'] = scorer.availability.score;
      entry['Availability reason'] = scorer.availability.reason;
    }
    return entry;
  });

  console.table(logTable);
}

export function displayDate(date) {
  return new Intl.DateTimeFormat('fr', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Zurich',
  }).format(date);
}
