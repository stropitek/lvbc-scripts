import { loadMatches } from '../core/matches.mjs';

const toCheck = './spreadsheets/output.xlsx';

const matches = await loadMatches(toCheck);
