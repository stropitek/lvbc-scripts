export const year = 2024;

export const factors = {
  // Each assigned match counts as 2
  'Lausanne M18G': 2.5,
};

// Those teams cannot be assigned matches
export const exempted = {
  'Lausanne M17F': true,
};

export const clubdeskPlayersFile = 'files/24/input/clubdesk-players.csv';
// ↓↓↓ init-scorers.mjs
export const playersFile = 'files/24/output/players.csv';

export const VBManagerInputFile = 'files/24/input/vb-manager.xlsx';
// ↓↓↓ init-schedule.mjs
export const preassignedFile = 'files/24/input/pre-assigned.xlsx';
// ↓↓↓ fill-schedule.mjs
export const assignedFile = 'files/24/output/assigned.xlsx';
export const tunedFile = 'files/24/input/assigned-tuned.xlsx';

// ↓↓↓ rewrite.mjs, from tuned file and VBManagerInputFile
export const rewriteFileExternal = 'files/24/output/googlesheet-rewritten.xlsx';

// ↓↓↓ Google sheet export
export const tunedFileExternal = 'files/24/input/googlesheet.xlsx';

export const SEASON_START = new Date('2024-09-01');

// [day, timeStart, timeEnd]
// day: from 0 = Sunday to 6 = Saturday
// time: 'HH:mm'
export const trainingSchedule = {
  M1: [
    [2, '20:00', '22:00'],
    [4, '19:30', '22:30'],
  ],
  M2: [
    [2, '21:00', '22:30'],
    [4, '20:00', '22:00'],
  ],
  M4: [
    [2, '20:00', '22:00'],
    [4, '19:30', '22:30'],
  ],
  M20F: [
    [2, '18:00', '19:30'],
    [4, '18:00', '20:00'],
  ],
  F2: [
    [1, '20:00', '22:00'],
    [3, '20:00', '22:00'],
  ],
  F4: [
    [1, '20:00', '22:00'],
    [4, '19:30', '21:00'],
  ],
  M23F: [
    [1, '18:00', '20:00'],
    [4, '18:00', '19:30'],
  ],
  M18G: [
    [2, '18:00', '20:00'],
    [4, '18:00', '19:30'],
  ],
};

export const ASSIGNMENT_CUTOFF = new Date('2025-10-26');

export const MAX_ASSIGNMENTS = 2;

export const MAX_MATCH_AFTER_TRAINING_MINUTES = 45;
export const MIN_MATCH_BEFORE_TRAINING_MINUTES = 1440;
