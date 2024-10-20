import { equipeToLeague } from '../scripts/2024/params.mjs';

import { GENDER, LEAGUE, TEAM_AWAY, TEAM_HOME } from './constants.mjs';

/**
 *
 * @param {*} match The VB match with CL and H/F
 */
export function translateLeagueToClubdesk(match) {
  let league = match[LEAGUE];
  const gender = match[GENDER];
  if (
    league.toLowerCase() === 'coupe vaudoise' ||
    league.toLowerCase().endsWith('volley cup')
  ) {
    league =
      equipeToLeague[match[TEAM_HOME]] || equipeToLeague[match[TEAM_AWAY]];
  }

  if (league.startsWith('U')) {
    // U for "unter" => juniors
    const age = league.substring(1);
    return `M${age}${gender === 'H' ? 'G' : 'F'}`;
  } else if (/^\dL$/.test(league)) {
    return `${gender === 'H' ? 'M' : 'F'}${league[0]}`;
  } else {
    throw new Error(`Unknown league pattern ${league}`);
  }
}
