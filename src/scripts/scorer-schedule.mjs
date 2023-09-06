import {
  filterHomeMatches,
  initMatchAssignments,
  loadMatches,
} from '../core/matches.mjs';
import { DATE, SCORER_TEAM } from '../utils/constants.mjs';
import { logAssignmentLength } from '../utils/log.mjs';
import { writeXlsx } from '../utils/xlsx.mjs';

import { canScoreMatch } from './2023/checks.mjs';
import { xlsxFile, factors, exempted, outputFile } from './2023/params.mjs';

const allMatches = await loadMatches(xlsxFile);

const regularMatches = allMatches.filter((line) => line[DATE].getDay() < 5);
const otherMatches = allMatches.filter(
  (line) => !regularMatches.includes(line),
);

console.log(
  `${regularMatches.length} regular matches, ${otherMatches.length} other matches`,
);

const allHomeMatches = filterHomeMatches(allMatches);

const assignedMatchesPerTeam = initMatchAssignments(allMatches);

mainLoop: for (let homeMatch of allHomeMatches) {
  const nextTeams = getNextTeams(assignedMatchesPerTeam);
  for (let team of nextTeams) {
    if (canScoreMatch(homeMatch, team, allMatches)) {
      homeMatch[SCORER_TEAM] = team;
      assignedMatchesPerTeam[team].push(homeMatch);
      continue mainLoop;
    }
  }
  throw new Error('No team can score this match');
}

console.log('\n');

logAssignmentLength(assignedMatchesPerTeam);

const assignedMatches = [];
for (let team of Object.keys(assignedMatchesPerTeam)) {
  assignedMatches.push(...assignedMatchesPerTeam[team]);
}

await writeXlsx(assignedMatches, outputFile, 'Assignation marqueurs');

function getNextTeams(assignedMatches) {
  const result = Array.from(Object.entries(assignedMatches))
    .sort(
      (entry1, entry2) =>
        (factors[entry1[0]] || 1) * entry1[1].length +
        (exempted[entry1[0]] ? Infinity : 0) -
        (factors[entry2[0]] || 1) * entry2[1].length +
        (exempted[entry2[0]] ? Infinity : 0),
    )
    .map((entry) => entry[0]);
  return result;
}
