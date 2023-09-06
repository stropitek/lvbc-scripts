export function logConflict(matchToAssign, otherMatch) {
  console.table({ matchToAssign, otherMatch });
}

export function logAssignmentLength(assignedMatchesPerTeam) {
  for (let [team, matches] of Object.entries(assignedMatchesPerTeam)) {
    console.log(team, matches.length);
  }
}
