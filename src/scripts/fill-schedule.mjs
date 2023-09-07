import { initMatchAssignments, loadMatches } from '../core/matches.mjs';
import { SCORER_TEAM } from '../utils/constants.mjs';
import { logAssignmentLength } from '../utils/log.mjs';
import { writeXlsx } from '../utils/xlsx.mjs';

import { canScoreMatch, hasTraining } from './2023/checks.mjs';
import {
  factors,
  exempted,
  outputFile,
  preassignedFile,
  MAX_ASSIGNMENTS,
  xlsxFile,
} from './2023/params.mjs';

const allMatches = await loadMatches(xlsxFile);

const allHomeMatches = await loadMatches(preassignedFile);

console.log(
  allHomeMatches.reduce(
    (acc, match) => (match[SCORER_TEAM] ? acc + 1 : acc),
    0,
  ),
  'matches already assigned',
);

const assignedMatchesPerTeam = initMatchAssignments(allHomeMatches);

mainLoop: for (let homeMatch of allHomeMatches) {
  if (homeMatch[SCORER_TEAM]) {
    continue;
  }
  const nextTeams = getNextTeams(assignedMatchesPerTeam, homeMatch);
  for (let team of nextTeams) {
    if (canScoreMatch(homeMatch, team, allMatches)) {
      homeMatch[SCORER_TEAM] = team;
      assignedMatchesPerTeam[team].push(homeMatch);
      continue mainLoop;
    }
  }
  throw new Error('No team can score this match');
}

logAssignmentLength(assignedMatchesPerTeam);

const assignedMatches = [];
for (let team of Object.keys(assignedMatchesPerTeam)) {
  assignedMatches.push(...assignedMatchesPerTeam[team]);
}

await writeXlsx(assignedMatches, outputFile);

function getNextTeams(assignedMatches, match) {
  const result = Array.from(Object.entries(assignedMatches))
    .sort((entry1, entry2) => {
      const team1 = entry1[0];
      const team2 = entry2[0];
      const nb1 = entry1[1].length;
      const nb2 = entry2[1].length;
      const factor1 = factors[team1] || 1;
      const factor2 = factors[team2] || 1;
      let penalty1 = nb1 >= MAX_ASSIGNMENTS / factor1 ? 1_000 : 0;
      if (hasTraining(match, team1)) {
        penalty1 += 500;
      }
      let penalty2 = nb2 >= MAX_ASSIGNMENTS / factor2 ? 1_000 : 0;
      if (hasTraining(match, team2)) {
        penalty2 += 500;
      }

      return (
        (factors[entry1[0]] || 1) * nb1 +
        (exempted[entry1[0]] ? 1_000_000 : 0) +
        penalty1 -
        (factors[entry2[0]] || 1) * nb2 -
        (exempted[entry2[0]] ? 1_000_000 : 0) -
        penalty2
      );
    })
    .map((entry) => entry[0]);
  return result;
}
