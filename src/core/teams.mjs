const lausanneReg = /^(?<prefix>VBC )?Lausanne/;

export function isLausanneTeam(team) {
  return team?.match(lausanneReg);
}
