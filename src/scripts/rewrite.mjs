import { DATE, MATCH_ID } from '../utils/constants.mjs';
import { loadXlsx, writeXlsx } from '../utils/xlsx.mjs';

import {
  rewriteFileExternal,
  tunedFileExternal,
  VBManagerInputFile,
} from './2023/params.mjs';

const tunedMatches = await loadXlsx(tunedFileExternal);
const originalMatches = await loadXlsx(VBManagerInputFile);

console.log(tunedMatches[0]);
for (let tunedMatch of tunedMatches) {
  const preassignedMatch = originalMatches.find(
    (match) => String(match[MATCH_ID]) === String(tunedMatch[MATCH_ID]),
  );
  if (!preassignedMatch) {
    throw new Error(
      `Match ${tunedMatch[MATCH_ID]} not found in original matches`,
    );
  }
  tunedMatch[DATE] = preassignedMatch[DATE];
}

console.log(tunedMatches[0]);

await writeXlsx(tunedMatches, rewriteFileExternal);
