import assert from 'node:assert';

import { DATE, SCORER_TEAM, TEAM_HOME } from '../utils/constants.mjs';
import { convertTZ } from '../utils/date.mjs';
import { loadXlsx } from '../utils/xlsx.mjs';

import { getTeams, isLausanneTeam } from './teams.mjs';

export async function loadMatches(file, sheetName) {
  const data = await loadXlsx(file, sheetName);
  return filterAndSortMatches(normalizeMatches(data));
}

function normalizeMatches(matches) {
  return matches.map((match) => {
    match[DATE] = convertTZ(match[DATE], 'Europe/Zurich');
    return match;
  });
}

function filterAndSortMatches(matches) {
  return matches
    .filter((line) => line)
    .filter((line) => line[DATE].getTime() > Date.now())
    .sort((line1, line2) => line1[DATE].getTime() - line2[DATE].getTime());
}

export function initMatchAssignments(allMatches) {
  const teams = getTeams(allMatches);
  const lausanneTeams = teams.filter(isLausanneTeam);
  const homeMatches = filterHomeMatches(allMatches);

  const assignedMatchesPerTeam = {};
  for (let team of lausanneTeams) {
    assignedMatchesPerTeam[team] = [];
  }

  for (let match of homeMatches) {
    const scorer = match[SCORER_TEAM];
    if (scorer) {
      assert(lausanneTeams.includes(scorer));
      assignedMatchesPerTeam[match[SCORER_TEAM]].push(match);
    }
  }
  return assignedMatchesPerTeam;
}

export function filterHomeMatches(allMatches) {
  const teams = getTeams(allMatches);
  const lausanneTeams = teams.filter(isLausanneTeam);

  return allMatches.filter((match) => lausanneTeams.includes(match[TEAM_HOME]));
}
