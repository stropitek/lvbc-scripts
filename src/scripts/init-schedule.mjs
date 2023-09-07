import fs from 'node:fs/promises';

import { filterHomeMatches, loadMatches } from '../core/matches.mjs';
import { SCORER_TEAM } from '../utils/constants.mjs';
import { writeXlsx } from '../utils/xlsx.mjs';

import { xlsxFile, preassignedFile } from './2023/params.mjs';

try {
  await fs.access(preassignedFile);
  console.error(`File ${preassignedFile} already exists`);
} catch {
  // File does not exist, continue

  const matches = await loadMatches(xlsxFile);
  matches[0][SCORER_TEAM] = '';
  const homeMatches = filterHomeMatches(matches);

  await writeXlsx(homeMatches, preassignedFile, 'Sheet1');
}
