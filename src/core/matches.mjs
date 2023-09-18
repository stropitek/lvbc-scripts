import assert from 'node:assert';

import {
  DATE,
  MATCH_ID,
  RECEIVING_TEAM,
  SCORER_TEAM,
} from '../utils/constants.mjs';
import { loadXlsx } from '../utils/xlsx.mjs';

import { getTeams, isLausanneTeam } from './teams.mjs';

export async function loadMatches(file, sheetName) {
  const data = await loadXlsx(file, sheetName);
  return filterAndSortMatches(data);
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

  const assignedMatchesPerTeam = {};
  for (let team of lausanneTeams) {
    assignedMatchesPerTeam[team] = [];
  }

  for (let match of allMatches) {
    const scorer = match[SCORER_TEAM];
    if (scorer) {
      assert(lausanneTeams.includes(scorer));
      assignedMatchesPerTeam[match[SCORER_TEAM]].push(match);
    } else {
      throw new Error(`no scorer team for match ${match[MATCH_ID]}`);
    }
  }
  return assignedMatchesPerTeam;
}

export function filterHomeMatches(allMatches) {
  return allMatches.filter((match) => match[RECEIVING_TEAM] === 'VBC Lausanne');
}
