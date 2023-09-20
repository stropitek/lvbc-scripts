export const factors = {
  // Each assigned match counts as 2
  'Lausanne M18G': 2.5,
};

// Those teams cannot be assigned matches
export const exempted = {
  'Lausanne M17F': true,
};

export const outputFile = 'output/23/assigned.xlsx';
export const rewriteFileExternal = 'output/23/googlesheet-rewritten.xlsx';

export const VBManagerInputFile = 'input/23/vb-manager.xlsx';
export const preassignedFile = 'input/23/pre-assigned.xlsx';
export const tunedFile = 'input/23/assigned-tuned.xlsx';
export const tunedFileExternal = 'input/23/googlesheet.xlsx';

export const SEASON_START = new Date('2022-09-01');

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
