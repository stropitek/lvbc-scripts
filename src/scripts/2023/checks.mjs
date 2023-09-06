import { DATE, TEAM_AWAY, TEAM_HOME } from '../../utils/constants.mjs';
import { isSameDay } from '../../utils/date.mjs';
import { logConflict } from '../../utils/log.mjs';

export function canScoreMatch(match, team, allMatches) {
  const teamMatches = allMatches.filter(
    (match) => match[TEAM_AWAY] === team || match[TEAM_HOME] === team,
  );
  const conflictingMatch = teamMatches.find((teamMatch) =>
    isSameDay(teamMatch[DATE], match[DATE]),
  );
  if (conflictingMatch) {
    console.log(`${team} has a conflict`);
    logConflict(match, conflictingMatch);
  }
  return !teamMatches.some((teamMatch) =>
    isSameDay(teamMatch[DATE], match[DATE]),
  );
}
