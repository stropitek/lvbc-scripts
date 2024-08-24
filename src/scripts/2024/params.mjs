export const year = 2024;

export const factors = {
  // Each assigned match counts as 2
  'Lausanne M18G': 2.5,
};

// Those teams cannot be assigned matches
export const exempted = {
  'Lausanne M17F': true,
};

export const outputFile = 'output/24/assigned.xlsx';
export const playersFile = 'output/24/players.csv';
export const rewriteFileExternal = 'output/24/googlesheet-rewritten.xlsx';

export const VBManagerInputFile = 'input/24/vb-manager.xlsx';
export const clubdeskPlayersFile = 'input/24/clubdesk-players.csv';
export const preassignedFile = 'input/24/pre-assigned.xlsx';
export const tunedFile = 'input/24/assigned-tuned.xlsx';
export const tunedFileExternal = 'input/24/googlesheet.xlsx';

export const SEASON_START = new Date('2024-09-01');

// from 0 = Sunday to 6 = Saturday
// Matches are almost always at 20:30 so we don't add to the schedule if they train before
export const trainingSchedule = {
  'Lausanne III M4': [2, 4],
  'Lausanne II F4': [2, 4],
  'Lausanne II M2': [2, 4],
  'Lausanne M19F': [],
  'Lausanne M18G': [],
  'Lausanne M23F': [4],
  'Lausanne I F3': [1],
  'VBC Lausanne': [2, 4],
  'Lausanne M17F': [],
};

export const MAX_ASSIGNMENTS = 10;
