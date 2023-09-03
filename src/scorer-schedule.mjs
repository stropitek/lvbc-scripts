import { loadXlsx, writeXlsx } from './utils/xlsx.mjs';

const xlsxFile = 'matches-23.xlsx';
const sheetName = 'Sheet1';

const lausanneReg = /^(VBC )?Lausanne/;

const TEAM_HOME = 'Equipe recevante';
const TEAM_AWAY = 'Equipe visiteuse';
const DATE = 'Date/heure de début du match';

const data = await loadXlsx(xlsxFile, sheetName);

const allMatches = data
  .filter((line) => line)
  .filter((line) => line[DATE].getTime() > Date.now())
  .sort((line1, line2) => line1[DATE].getTime() - line2[DATE].getTime());

const teams = Array.from(
  new Set(allMatches.flatMap((match) => [match[TEAM_HOME], match[TEAM_AWAY]])),
);
const lausanneTeams = teams.filter((team) => team?.match(lausanneReg));

const homeMatches = allMatches.filter((match) =>
  lausanneTeams.includes(match[TEAM_HOME]),
);

console.log(`${allMatches.length} at home, ${homeMatches.length} in Lausanne`);

const assignedMatchesPerTeam = {};
for (let team of lausanneTeams) {
  assignedMatchesPerTeam[team] = [];
}

mainLoop: for (let homeMatch of homeMatches) {
  const nextTeams = getNextTeams(assignedMatchesPerTeam);
  for (let team of nextTeams) {
    if (canScoreMatch(homeMatch, team, allMatches)) {
      homeMatch['Equipe marqueur'] = team;
      assignedMatchesPerTeam[team].push(homeMatch);
      continue mainLoop;
    }
  }
  throw new Error('No team can score this match');
}

console.log('\n');

Object.entries(assignedMatchesPerTeam).forEach(([team, matches]) =>
  console.log(team, matches.length),
),
  console.log('\nNumber of home matches', homeMatches.length);

const assignedMatches = [];
for (let team of Object.keys(assignedMatchesPerTeam)) {
  assignedMatches.push(...assignedMatchesPerTeam[team]);
}
await writeXlsx(assignedMatches, 'output.xlsx', 'Assignation marqueurs');

function getNextTeams(assignedMatches) {
  const result = Array.from(Object.entries(assignedMatches))
    .sort((entry1, entry2) => entry1[1].length - entry2[1].length)
    .map((entry) => entry[0]);
  return result;
}

function canScoreMatch(match, team, allMatches) {
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

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function logConflict(matchToAssign, otherMatch) {
  console.table({ matchToAssign, otherMatch });
}
