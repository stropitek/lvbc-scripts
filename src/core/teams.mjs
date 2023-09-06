import { TEAM_AWAY, TEAM_HOME } from '../utils/constants.mjs';

const lausanneReg = /^(VBC )?Lausanne/;

export function getTeams(matches) {
  return Array.from(
    new Set(matches.flatMap((match) => [match[TEAM_HOME], match[TEAM_AWAY]])),
  );
}

export function isLausanneTeam(team) {
  return team?.match(lausanneReg);
}
