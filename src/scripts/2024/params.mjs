export const year = 2024;

export const factors = {
  // Each assigned match counts as 2
  'Lausanne M18G': 2.5,
};

// Those teams cannot be assigned matches
export const exempted = {
  'Lausanne M17F': true,
};

export const clubdeskPlayersFile = 'input/24/clubdesk-players.csv';
// ↓↓↓ init-scorers.mjs
export const playersFile = 'output/24/players.csv';

export const VBManagerInputFile = 'input/24/vb-manager.xlsx';
// ↓↓↓ init-schedule.mjs
export const preassignedFile = 'input/24/pre-assigned.xlsx';
// ↓↓↓ fill-schedule.mjs
export const assignedFile = 'output/24/assigned.xlsx';
export const tunedFile = 'input/24/assigned-tuned.xlsx';

// ↓↓↓ rewrite.mjs, from tuned file and VBManagerInputFile
export const rewriteFileExternal = 'output/24/googlesheet-rewritten.xlsx';

// ↓↓↓ Google sheet export
export const tunedFileExternal = 'input/24/googlesheet.xlsx';

export const SEASON_START = new Date('2024-09-01');

// from 0 = Sunday to 6 = Saturday
// Matches are almost always at 20:30 so we don't add to the schedule if they train before
export const trainingSchedule = {
  M1: [2, 4],
  M2: [2, 4],
  M4: [],
  M20F: [2, 4],
  F2: [2, 4],
  F4: [4],
  M23F: [1],
  M18G: [2],
};

export const MAX_ASSIGNMENTS = 2;
